import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { validate } from 'class-validator';
import { HaravanService } from '../haravan/haravan.service';
import { UserQueryDto } from './dto/user-query.dto';
import { UserInfoDto } from './dto/user-info';
import { StringUtils } from '../shared/utils/string.utils';
import { EUserRole } from './enums/user-role.enum';
import { CouponRefService } from '../coupon-ref/coupon-ref.service';
import { HaravanCustomerDto } from '../haravan/dto/haravan-customer.dto';
import { ECustomerRankNum } from '../customer-rank/enums/customer-rank.enum';
import { UserRedis } from './user.redis';
import { CrmService } from '../crm/crm.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly haravanService: HaravanService,
    private crmService: CrmService,
    private couponRefService: CouponRefService,
    private userRedis: UserRedis,
  ) {}

  async findUserNative(id: string) {
    const user = await this.userRepository.findOneBy({
      id: id,
    });
    return user;
  }

  async findUser(id: string) {
    let user = await this.userRedis.get(id);
    let crmCusData: any = {};
    const notCached = user == null;
    const fetchUser = async () => {
      user = await this.userRepository.findOneBy({
        id: id,
      });

      if (!user) return null;

      // crmCusData = await this.haravanService.findCustomer(user.haravanId);
      crmCusData = (
        await this.crmService.findAllCustomer({
          limit: 1,
          query: {
            id: user.crmId,
          },
        })
      ).data?.[0];

      await this.userRedis.set(id, {
        ...crmCusData,
        ...user,
      });
    };

    if (notCached) {
      await fetchUser();
    } else {
      setImmediate(fetchUser);
    }

    return {
      ...crmCusData,
      ...user,
      rank: user?.rank || ECustomerRankNum.silver,
      role: user?.role || EUserRole.customer,
    };
  }

  async findAllUser(query: UserQueryDto) {
    query.page = Number(query.page) || 1;
    query.limit = Number(query.limit) || 1;
    const [users, total] = await this.userRepository.findAndCount({
      skip: query.page,
      take: query.limit,
      where: [
        {
          phoneNumber: query.query ? Like(`%${query.query}%`) : null,
        },
        {
          name: query.query ? Like(`%${query.query}%`) : null,
        },
      ],
    });

    return {
      users,
      page: query.page,
      size: query.limit,
      total,
      totalPage: Math.ceil(total / query.limit),
    };
  }

  async syncCrmUser() {
    const users = await this.crmService.findAllCustomer({
      limit: 10,
    });

    console.log(users);

    const promises = users.data.map(async (u) => {
      try {
        console.log(u.id);
        if (u.maKhachHang && u.haravanId) {
          await this.userRepository.save({
            haravanId: u.haravanId,
            crmId: u.id,
            name: u.name.value,
            authId: u.phones?.[0]?.value,
            phoneNumber: u.phones?.[0]?.value,
            address1: u.address1,
            maKhachHang: u.maKhachHang,
            role: /^kh|KH/.test(u.maKhachHang)
              ? EUserRole.customer
              : EUserRole.staff,
          });
        }
      } catch (e) {
        console.log(e);
      }
    });

    await Promise.race(promises);
  }

  //!TODO: CREATE USER & SYNC FROM HARAVAN
  async createUser(data: UserInfoDto) {
    try {
      await validate(data, {
        whitelist: true,
      });

      if (data.role == EUserRole.admin) {
        throw new HttpException(
          "Can't create customer with admin role",
          HttpStatus.BAD_REQUEST,
        );
      }

      const haravanCusData = await this.haravanService.createCustomer(data);
      const user = await this.userRepository.save({
        haravanId: haravanCusData.id,
        authId: data.phone,
        phoneNumber: data.phone,
        inviteCode: StringUtils.random(6),
        role: data.role,
      });

      return {
        ...haravanCusData,
        ...user,
      };
    } catch (e) {
      return e;
    }
  }

  async createUserFromHaravan(data: HaravanCustomerDto) {
    const user = await this.userRepository.save({
      authId: data.phone,
      phoneNumber: data.phone,
      inviteCode: StringUtils.random(6),
      role: EUserRole.customer,
      haravanId: data.id,
    });

    return user;
  }

  async updateNativeUser(user: User) {
    return await this.userRepository.save(user);
  }

  async createNativeUser(user) {
    return await this.userRepository.save(user);
  }

  async updateUser(userId: string, data: UserInfoDto) {
    try {
      await validate(data, {
        whitelist: true,
      });

      if (data.role == EUserRole.admin) {
        throw new HttpException(
          "Can't update customer with admin role",
          HttpStatus.BAD_REQUEST,
        );
      }

      let user = await this.userRepository.findOne({
        where: {
          id: userId,
        },
      });

      if (!user) {
        throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
      }

      const haravanCusData = await this.haravanService.updateCustomer(
        user.haravanId,
        data,
      );

      user = await this.userRepository.save({
        ...user,
        authId: data.phone ?? user.phoneNumber,
        phoneNumber: data.phone ?? user.phoneNumber,
        role: data.role ?? user.role,
      });

      return {
        ...haravanCusData,
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
}
