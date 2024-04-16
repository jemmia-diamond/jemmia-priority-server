import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly haravanService: HaravanService,
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
    let haravanCusData: any = {};
    const notCached = user == null;

    if (notCached) {
      user = await this.userRepository.findOneBy({
        id: id,
      });

      console.log(user);

      if (!user) return null;

      haravanCusData = await this.haravanService.findCustomer(user.haravanId);
    } else {
      setImmediate(async () => {
        user = await this.userRepository.findOneBy({
          id: id,
        });

        console.log(user);

        haravanCusData = await this.haravanService.findCustomer(user.haravanId);
        await this.userRedis.set(id, {
          ...haravanCusData,
          ...user,
        });
      });
    }

    setImmediate(() =>
      this.userRedis.set(id, {
        ...haravanCusData,
        ...user,
      }),
    );

    return {
      ...haravanCusData,
      ...user,
      rank: user?.rank || ECustomerRankNum.silver,
      role: user?.role || EUserRole.customer,
    };
  }

  async findAllUser(query: UserQueryDto) {
    query.page = Number(query.page);
    query.limit = Number(query.limit);

    const haravanCusData = await this.haravanService.findAllCustomer(query);
    const haravanCusCount = await this.haravanService.countAllCustomer();
    const haravanIds = haravanCusData.map((c) => c.id);
    const users = await this.userRepository.find({
      where: {
        haravanId: In(haravanIds),
      },
    });

    const usersList = haravanCusData.map((c) => {
      const user = users.find((u) => c.id == u.haravanId);
      return {
        ...c,
        ...user,
        rank: user?.rank || ECustomerRankNum.silver,
        role: user?.role || EUserRole.customer,
      };
    });

    return {
      users: usersList,
      page: query.page,
      size: query.limit,
      totalPage: Math.ceil(haravanCusCount / query.limit),
    };
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
