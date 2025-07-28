import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { validate } from 'class-validator';
import { HaravanService } from '../haravan/haravan.service';
import { UserQueryDto } from './dto/user-query.dto';
import { UserInfoDto } from './dto/user-info';
import { EUserRole } from './enums/user-role.enum';
import { CouponRefService } from '../coupon-ref/coupon-ref.service';
import { HaravanCustomerDto } from '../haravan/dto/haravan-customer.dto';
import { ECustomerRankNum } from '../customer-rank/enums/customer-rank.enum';
import { UserRedis } from './user.redis';
import { CrmService } from '../crm/crm.service';
import { CustomerRankService } from '../customer-rank/customer-rank.service';
import { ECrmCustomerGender } from '../crm/enums/crm-customer.enum';
import * as moment from 'moment';
import { UserUpdateCrmInfoDto } from './dto/user-update-profile.dto';
import { Withdraw } from '../withdraw/entities/withdraw.entity';
import { EWithdrawStatus } from '../withdraw/dto/withdraw-status.dto';
import { ReturnUserPriorityDto } from './dto/get-user-priority.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly haravanService: HaravanService,
    private crmService: CrmService,
    private couponRefService: CouponRefService,
    @InjectRepository(Withdraw)
    private readonly withdraws: Repository<Withdraw>,
    private userRedis: UserRedis,
    @Inject(forwardRef(() => CustomerRankService))
    private readonly customerRankService: CustomerRankService,
  ) {}

  async findUserNative(id: string) {
    const user = await this.userRepository.findOneBy({
      id: id,
    });
    return user;
  }

  async findUser(id: string) {
    let user = await this.userRedis.get(id);
    const notCached = user == null;
    const fetchUser = async () => {
      user = await this.userRepository.findOneBy({
        id: id,
      });

      if (!user) return null;

      user = await this.syncFromCrm(user.crmId);

      await this.userRedis.set(id, {
        ...user,
      });
    };

    const withdrawPending = await this.withdraws.sum('amount', {
      user: {
        id: id,
      },
      status: EWithdrawStatus.pending,
    });

    const withdrawSuccess = await this.withdraws.sum('amount', {
      user: {
        id: id,
      },
      status: EWithdrawStatus.done,
    });

    if (notCached) {
      await fetchUser();
    } else {
      setImmediate(fetchUser);
    }

    return {
      ...user,
      rank: user?.rank || ECustomerRankNum.silver,
      role: user?.role || EUserRole.customer,
      withdrawPending: withdrawPending || 0,
      withdrawSuccess: withdrawSuccess || 0,
    };
  }

  async findAllUser(query: UserQueryDto) {
    query.limit = Number(query.limit) || 1;
    const offset = ((query.page || 1) - 1) * query.limit;
    const [users, total] = await this.userRepository.findAndCount({
      skip: offset,
      take: query.limit,
      where: [
        {
          phoneNumber: query.query ? Like(`%${query.query}%`) : null,
        },
        {
          name: query.query ? Like(`%${query.query}%`) : null,
        },
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      users,
      page: offset,
      size: query.limit,
      total,
      totalPage: Math.ceil(total / query.limit),
    };
  }

  //!TODO: CREATE USER & SYNC FROM HARAVAN
  async createUser(data: UserInfoDto) {
    // try {
    //   await validate(data, {
    //     whitelist: true,
    //   });
    //   if (data.role == EUserRole.admin) {
    //     throw new HttpException(
    //       "Can't create customer with admin role",
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }
    //   const haravanCusData = await this.haravanService.createCustomer(data);
    //   const user = await this.userRepository.save({
    //     haravanId: haravanCusData.id,
    //     authId: data.phone,
    //     phoneNumber: data.phone,
    //     inviteCode: StringUtils.random(6),
    //     role: data.role,
    //   });
    //   return {
    //     ...haravanCusData,
    //     ...user,
    //   };
    // } catch (e) {
    //   return e;
    // }
  }

  async createUserFromHaravan(data: HaravanCustomerDto) {
    //Find from CRM
    console.log('CREATE USER CRM');
    console.log({
      limit: 1,
      query: {
        haravan_id: data.id,
      },
    });
    const crmCusData = (
      await this.crmService.findAllCustomer({
        limit: 1,
        query: {
          haravan_id: data.id.toString(),
        },
      })
    ).data?.[0];

    if (!crmCusData) return;

    return this.syncFromCrm(crmCusData.id);
  }

  async updateNativeUser(user: User) {
    return this.userRepository.save(user);
  }

  async createNativeUser(user) {
    return await this.userRepository.save(user);
  }

  async updateUser(userId: string, data: UserInfoDto) {
    try {
      await validate(data, {
        whitelist: true,
      });

      let user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
      }

      user = await this.userRepository.save({
        ...user,
        bankingAccount: data.bankingAccount || user.bankingAccount,
        frontIDCardImageUrl:
          data.frontIDCardImageUrl || user.frontIDCardImageUrl,
        backIDCardImageUrl: data.backIDCardImageUrl || user.backIDCardImageUrl,
      });

      return {
        ...user,
      };
    } catch (e) {
      return e;
    }
  }

  async deleteById(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete(id);
  }

  //#region CRM
  /** Sync điểm ref point của hệ thống qua CRM */
  async updateCrmRefPoint(crmId: string, refPoint: number) {
    await this.crmService.updateCustomer(crmId, [
      {
        key: 'cumulative_tov_referral',
        value: refPoint,
      },
    ]);

    console.log('U CRM REF POINT');
    console.log(refPoint);
  }

  //** Gửi yêu cầu đổi thông tin cá nhân qua CRM */
  async sendUpdateInfoRequestToCrm(crmId: string, body: UserUpdateCrmInfoDto) {
    await validate(body);

    const crmPayload = [];

    if (body.email) {
      crmPayload.push({
        key: 'customer_email_update_pwa',
        value: body.email,
      });
    }

    if (body.birthday) {
      crmPayload.push({
        key: 'customer_birthday_update_pwa',
        value: body.birthday,
      });
    }

    await this.userRepository.update(
      {
        crmId,
      },
      {
        customerEmailUpdatePwa: body.email,
        customerBirthdayUpdatePwa: body.birthday,
      },
    );
    console.log(crmPayload);
    await this.crmService.updateCustomer(crmId, crmPayload);
  }

  //** Sync thời gian login lần đầu qua CRM */
  async updateCrmFirstLoginDate(crmId: string, date: Date) {
    // const formatDate = moment(date).format('HH:mm:ss DD/MM/YYYY');

    await this.crmService.updateCustomer(crmId, [
      {
        key: 'app_first_login_date',
        value: date.getTime(),
      },
    ]);
  }

  //*Sync thời gian login lần cuối qua CRM */
  async updateCrmLastLoginDate(crmId: string, date: Date) {
    const formatDate = moment(date).format('HH:mm:ss DD/MM/YYYY');

    console.log([
      {
        key: 'app_last_login_date',
        value: formatDate,
      },
    ]);

    await this.crmService.updateCustomer(crmId, [
      {
        key: 'app_last_login_date',
        value: formatDate,
      },
    ]);
  }

  /** Sync thông tin user từ CRM về hệ thống & phân hạng */
  async syncFromCrm(crmId: string) {
    let user: User = await this.userRepository.findOneBy({ crmId });
    const crmCusData = (
      await this.crmService.findAllCustomer({
        limit: 1,
        query: {
          id: crmId,
        },
      })
    ).data?.[0];

    if (!crmCusData) return null;

    if (user) {
      //Tính rank cho user
      user = await this.customerRankService.calcRankAndSetToUser({ ...user });
    }

    let crmBirtDate: string;

    if (crmCusData.birthDate) {
      crmBirtDate = moment(crmCusData.birthDate).format('DD/MM/YYYY');
    }

    crmCusData.cumulativeTovLifeTime =
      crmCusData.cumulativeTovLifeTime <= 0
        ? 0
        : crmCusData.cumulativeTovLifeTime;

    crmCusData.cumulativeTovInLast12mos =
      crmCusData.cumulativeTovInLast12mos <= 0
        ? 0
        : crmCusData.cumulativeTovInLast12mos;

    crmCusData.cumulativeTovReferral =
      crmCusData.cumulativeTovReferral <= 0
        ? 0
        : crmCusData.cumulativeTovReferral;

    let userRole = user?.role;
    if (
      (userRole === EUserRole.customer || !userRole) &&
      crmCusData.customerTypes?.[0]?.value === EUserRole.staff
    ) {
      userRole = EUserRole.staff;
    } else if (!userRole) {
      userRole = EUserRole.customer;
    }

    user = await this.userRepository.save({
      ...user,
      haravanId: crmCusData.haravanId,
      crmId: crmCusData.id,
      name: crmCusData.name.value,
      authId: crmCusData.phones?.[0]?.value,
      phoneNumber: crmCusData.phones?.[0]?.value,
      address1: crmCusData.address1,
      maKhachHang: crmCusData.maKhachHang,
      cumulativeTovRecorded: crmCusData.cumulativeTovRecorded || 0,
      accumulatedOrderPoint: crmCusData.cumulativeTovInLast12mos || 0,
      accumulatedRefPoint: crmCusData.cumulativeTovReferral || 0,
      gender: ECrmCustomerGender[crmCusData.gioiTinh?.[0]?.value] ?? 0,
      customerBirthdayUpdatePwa: crmBirtDate,
      customerEmailUpdatePwa: crmCusData.emails?.[0]?.value,
      role: userRole,
    });

    return user;
  }

  async syncCrmUsers() {
    const users = await this.crmService.findAllCustomer({
      limit: 9999999999,
      skip: 7976,
    });

    let index = 7976;

    for (const u of users.data) {
      try {
        console.log(`${index}/${users.total}`);
        if (u.maKhachHang && u.haravanId) {
          await this.userRepository.save({
            haravanId: u.haravanId,
            crmId: u.id,
            name: u.name.value,
            authId: u.phones?.[0]?.value,
            phoneNumber: u.phones?.[0]?.value,
            address1: u.address1,
            maKhachHang: u.maKhachHang,
            cumulativeTovRecorded: u.cumulativeTovLifeTime,
            role: /^kh|KH/.test(u.maKhachHang)
              ? EUserRole.customer
              : EUserRole.staff,
          });
        }
        index++;
      } catch (e) {
        console.log(e);
      }
    }
  }

  async getUserPriorityById(haravanId: string): Promise<ReturnUserPriorityDto> {
    // Use your user repository instance here, e.g. this.userRepository
    const query = this.userRepository
      .createQueryBuilder('c')
      .select('c.haravanId', 'haravanId')
      .addSelect('COALESCE(SUM(o.totalPrice), 0)', 'totalReferAmount')
      .addSelect('COALESCE(SUM(c.point), 0)', 'totalCashBack')
      .addSelect('COALESCE(SUM(wd.amount), 0)', 'withdrawAmount')
      .innerJoin('coupon_refs', 'cf', 'c.id = cf.ownerId')
      .innerJoin('orders', 'o', 'o.couponRefId = cf.id')
      .leftJoin('withdraws', 'wd', 'wd.userId = c.id')
      .where('c.haravanId = :haravanId', { haravanId })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('c.haravanId');

    const result = await query.getRawOne();

    return {
      haravanId: haravanId,
      totalReferAmount: Number(result?.totalReferAmount) || 0,
      totalCashBack: Number(result?.totalCashBack) || 0,
      withdrawAmount: Number(result?.withdrawAmount) || 0,
    };
  }

  async getAllUserPriority(): Promise<{ results: ReturnUserPriorityDto[] }> {
    // Query 1: Referral info for all users
    const referList = await this.userRepository
      .createQueryBuilder('c')
      .select('c.id', 'id')
      .addSelect('c.haravanId', 'haravanId')
      .addSelect('COALESCE(SUM(o.totalPrice), 0)', 'totalReferAmount')
      .addSelect('COALESCE(c.point, 0)', 'remainingCashback')
      .innerJoin('coupon_refs', 'cf', 'cf.ownerId = c.id')
      .innerJoin(
        'orders',
        'o',
        'o.couponRefId = cf.id AND o.paymentStatus = :paid',
        { paid: 'paid' },
      )
      .where('cf.usedById IS NOT NULL')
      .groupBy('c.id')
      .addGroupBy('c.haravanId')
      .addGroupBy('c.point')
      .getRawMany();

    // Query 2: All withdraws (grouped by userId)
    const withdrawList = await this.userRepository.manager
      .createQueryBuilder()
      .select('w.userId', 'userId')
      .addSelect('COALESCE(SUM(w.amount), 0)', 'withdrawAmount')
      .from('withdraws', 'w')
      .where('w.status = :status', { status: 'done' })
      .groupBy('w.userId')
      .getRawMany();

    // Map withdrawAmount by userId
    const withdrawMap = new Map<string, number>();
    for (const w of withdrawList) {
      withdrawMap.set(w.userId, Number(w.withdrawAmount) || 0);
    }

    const results: any[] = referList.map((r) => ({
      haravanId: r.haravanId,
      totalReferAmount: Number(r.totalReferAmount) || 0,
      remainingCashback: Number(r.remainingCashback) || 0,
      withdrawAmount: withdrawMap.get(r.id) || 0,
    }));

    return { results };
  }
}
