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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly haravanService: HaravanService,
    private couponRefService: CouponRefService,
  ) {}

  async findUserNative(id: string) {
    const user = await this.userRepository.findOneBy({
      id: id,
    });
    return user;
  }

  async findUser(id: string) {
    const user = await this.userRepository.findOneBy({
      id: id,
    });

    const haravanCusData = await this.haravanService.findCustomer(
      user.haravanId,
    );

    return {
      ...haravanCusData,
      ...user,
    };
  }

  async findAllUser(query: UserQueryDto) {
    const page = query.page;
    const size = query.limit;

    const haravanCusData = await this.haravanService.findAllCustomer(query);
    const haravanIds = haravanCusData.map((c) => c.id);
    let users = await this.userRepository.find({
      skip: (page - 1) * size,
      take: size,
      where: {
        haravanId: In(haravanIds),
      },
    });

    users = haravanCusData.map((c) => ({
      ...c,
      ...users.find((u) => c.id == u.haravanId),
    }));

    return {
      users,
      page,
      size,
      totalPage: Math.ceil((await this.userRepository.count()) / size),
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

      //create Invite Coupon
      await this.couponRefService.createInvite({
        ownerId: user.id,
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

    //Create invite coupon
    await this.couponRefService.createInvite({
      ownerId: user.id,
      role: user.role,
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

  async findHaravanId(haravanId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({
      haravanId: haravanId,
    });

    const haravanCusData = await this.userRepository.findOneBy({
      haravanId: haravanId,
    });

    console.log({
      ...haravanCusData,
      ...user,
    });

    return {
      ...haravanCusData,
      ...user,
    };
  }
}
