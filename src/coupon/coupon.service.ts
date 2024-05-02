import { BadRequestException, Injectable } from '@nestjs/common';
import { HaravanService } from '../haravan/haravan.service';
import { CouponDto, CouponSearchDto } from './dto/coupon.dto';
import { GiftDto } from './dto/gift.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { ECouponType } from './enums/gift-type.enum';
import { User } from '../user/entities/user.entity';
import { CouponRedeemed } from './entities/coupon-user.entity';
import { validate } from 'class-validator';
import { ECouponDiscountType } from '../haravan/enums/coupon.enum';
import { Pagination } from 'nestjs-typeorm-paginate';
import { EUserRole } from '../user/enums/user-role.enum';
import { Notification } from '../notification/entities/notification.entity';
import { StringUtils } from '../shared/utils/string.utils';
import { NotificationType } from '../notification/enums/noti-type.enum';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CouponRedeemed)
    private couponUserRepository: Repository<CouponRedeemed>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private haravanService: HaravanService,
  ) {}

  async createCoupon(data: CouponDto) {
    try {
      return await this.haravanService.createCoupon(data);
    } catch (e) {
      return e;
    }
  }

  async updateCoupon(couponId: number, data: CouponDto) {
    try {
      data.id = couponId;
      return await this.haravanService.updateCoupon(data);
    } catch (e) {
      return e;
    }
  }

  async toggleStatus(couponId: number, enable: boolean) {
    try {
      return this.haravanService.toggleStatus(couponId, enable);
    } catch (e) {
      return e;
    }
  }

  async deleteCoupon(couponId: number) {
    try {
      return this.haravanService.deleteCoupon(couponId);
    } catch (e) {
      return e;
    }
  }

  async findCoupon(couponId: number) {
    try {
      return this.haravanService.findCoupon(couponId);
    } catch (e) {
      return e;
    }
  }

  async findAllCoupon(query: CouponSearchDto) {
    try {
      return {
        coupons: await this.haravanService.findAllCoupon(query),
      };
    } catch (e) {
      return e;
    }
  }

  async findAllGift(
    userId: string,
    role: string,
    page: number,
    limit: number,
  ): Promise<Pagination<Coupon>> {
    try {
      const offset = (page - 1) * limit;
      const currentDate = new Date();
      let items: Coupon[];
      let totalItems: number;

      const couponUser = await this.couponUserRepository.findOneBy({
        user: await this.userRepository.findOneBy({ id: userId }),
      });

      if (role === EUserRole.admin) {
        [items, totalItems] = await this.couponRepository.findAndCount({
          order: { createdDate: 'DESC' },
          skip: offset,
          take: limit,
        });
      } else {
        [items, totalItems] = await this.couponRepository.findAndCount({
          where: {
            startDate: MoreThanOrEqual(currentDate),
            endDate: LessThanOrEqual(currentDate),
            quantityLimit: MoreThanOrEqual(0),
            couponUser: [null, couponUser],
          },
          order: { createdDate: 'DESC' },
          skip: offset,
          take: limit,
        });
      }

      const totalPages = Math.ceil(totalItems / limit);

      const meta = {
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        totalItems,
        currentPage: page,
      };

      return new Pagination<Coupon>(items, meta);
    } catch (error) {
      throw error;
    }
  }

  async findGiftById(
    userId: string,
    role: string,
    couponId: string,
  ): Promise<Coupon | null> {
    try {
      const currentDate = new Date();
      let coupon: Coupon | null = null;

      const couponUser = await this.couponUserRepository.findOneBy({
        user: await this.userRepository.findOneBy({ id: userId }),
      });

      if (role === EUserRole.admin) {
        coupon = await this.couponRepository.findOneBy({ id: couponId });
      } else {
        coupon = await this.couponRepository.findOne({
          where: {
            id: couponId,
            startDate: MoreThanOrEqual(currentDate),
            endDate: LessThanOrEqual(currentDate),
            quantityLimit: MoreThanOrEqual(1),
            couponUser: [null, couponUser],
          },
        });
      }

      const dataReturn = {
        ...coupon,
        coupon: await this.findCoupon(coupon.couponId),
      };

      return dataReturn;
    } catch (error) {
      throw error;
    }
  }

  async createGift(data: GiftDto) {
    try {
      const queryRunner =
        this.couponRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const couponEntity = new Coupon();
      couponEntity.type = data.type;
      couponEntity.ten = data.ten;
      couponEntity.urlImage = data.urlImage;
      couponEntity.detail = data.detail;
      couponEntity.quantityLimit = data.quantityLimit;
      couponEntity.startDate = data.startDate;
      couponEntity.startDateHaravan = data.startDate;
      couponEntity.endDate = data.endDate;
      couponEntity.endDateHaravan = data.endDate;
      couponEntity.point = data.point;
      couponEntity.couponId = data.couponId;
      try {
        await validate(data, {
          whitelist: true,
        });

        if (data.type === ECouponType.product) {
          couponEntity.product = data.product;
        } else {
          const coupon = await this.findCoupon(data.couponId);
          if (!coupon) {
            throw new BadRequestException('Coupon Haravan not found.');
          }
          couponEntity.startDate = coupon.startsAt;
          couponEntity.endDate = coupon.EndsAt;
        }
        const Gift = await queryRunner.manager.save(couponEntity);

        const promises = data.userList.map(async (userId) => {
          const user = await this.userRepository.findOneBy({ id: userId });
          if (!user) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException('User not found.');
          }

          const couponUser = new CouponRedeemed();
          couponUser.user = user;
          couponUser.coupon = Gift;

          await queryRunner.manager.save(couponUser);
        });

        await Promise.all(promises);

        if (data.type === ECouponType.product) {
          const couponDto = new CouponDto();
          couponDto.isPromotion = true;
          couponDto.appliesOnce = false;
          couponDto.code = data.code;
          couponDto.startsAt = data.startDate.toDateString();
          couponDto.endsAt = data.endDate.toDateString();
          couponDto.minimumOrderAmount = 0;
          couponDto.usageLimit = data.quantityLimit;
          couponDto.value = 100;
          couponDto.discountType = ECouponDiscountType.percentage;
          couponDto.variants = data.variants;
          couponDto.setTimeActive = true;
          couponDto.appliesCustomerGroupId = data.appliesCustomerGroupId;
          couponDto.locationIds = data.locationIds;

          const couponHaravan = await this.createCoupon(couponDto);
          couponEntity.couponId = couponHaravan.id;
        }

        await queryRunner.commitTransaction();
        return await queryRunner.manager.save(couponEntity);
      } catch (e) {
        await queryRunner.rollbackTransaction();
        return e;
      } finally {
        await queryRunner.release();
      }
    } catch (e) {
      return e;
    }
  }

  async updateGift(id: string, data: GiftDto) {
    try {
      const queryRunner =
        this.couponRepository.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const couponEntity = await this.couponRepository.findOneBy({ id: id });
      if (!couponEntity) {
        throw new BadRequestException('Coupon not found.');
      }
      couponEntity.ten = data.ten;
      couponEntity.urlImage = data.urlImage;
      couponEntity.detail = data.detail;
      couponEntity.quantityLimit = data.quantityLimit;
      couponEntity.startDate = data.startDate;
      couponEntity.endDate = data.endDate;
      couponEntity.point = data.point;
      try {
        await validate(data, {
          whitelist: true,
        });

        if (data.type === ECouponType.product) {
          couponEntity.product = data.product;
        } else {
          const coupon = await this.findCoupon(data.couponId);
          if (!coupon) {
            throw new BadRequestException('Coupon Haravan not found.');
          }
          couponEntity.startDate = coupon.startsAt;
          couponEntity.endDate = coupon.EndsAt;
          couponEntity.couponId = data.couponId;
        }
        const Gift = await queryRunner.manager.save(couponEntity);

        await this.couponUserRepository.delete({
          coupon: Gift,
        });

        const promises = data.userList.map(async (userId) => {
          const user = await this.userRepository.findOneBy({ id: userId });
          if (!user) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException('User not found.');
          }

          const couponUser = new CouponRedeemed();
          couponUser.user = user;
          couponUser.coupon = Gift;

          await queryRunner.manager.save(couponUser);
        });

        await Promise.all(promises);

        if (data.type === ECouponType.product) {
          const couponDto = new CouponDto();
          couponDto.isPromotion = true;
          couponDto.appliesOnce = false;
          couponDto.code = data.code;
          couponDto.startsAt = data.startDate.toDateString();
          couponDto.endsAt = data.endDate.toDateString();
          couponDto.minimumOrderAmount = 0;
          couponDto.usageLimit = data.quantityLimit;
          couponDto.value = 100;
          couponDto.discountType = ECouponDiscountType.percentage;
          couponDto.variants = data.variants;
          couponDto.setTimeActive = true;
          couponDto.appliesCustomerGroupId = data.appliesCustomerGroupId;
          couponDto.locationIds = data.locationIds;

          await this.updateCoupon(couponEntity.couponId, couponDto);
        }

        await queryRunner.commitTransaction();
        return await queryRunner.manager.save(couponEntity);
      } catch (e) {
        await queryRunner.rollbackTransaction();
        return e;
      } finally {
        await queryRunner.release();
      }
    } catch (e) {
      return e;
    }
  }

  async deleteGift(id: string) {
    try {
      const couponEntity = await this.couponRepository.findOneBy({ id: id });
      if (!couponEntity) {
        throw new BadRequestException('Coupon not found.');
      }

      await this.couponUserRepository.delete({
        coupon: couponEntity,
      });

      await this.couponRepository.delete(couponEntity);

      if (couponEntity.type === ECouponType.product) {
        await this.deleteCoupon(couponEntity.couponId);
      }

      return couponEntity;
    } catch (error) {
      return error;
    }
  }

  async receiveGift(userId: string, id: string) {
    try {
      const currentDate = new Date();
      const user = await this.userRepository.findOneBy({ id: userId });
      const couponUser = await this.couponUserRepository.findOneBy({
        user: user,
      });
      const couponEntity = await this.couponRepository.findOne({
        where: {
          id,
          startDate: MoreThanOrEqual(currentDate),
          endDate: LessThanOrEqual(currentDate),
          quantityLimit: MoreThanOrEqual(1),
          point: LessThanOrEqual(user.point),
          couponUser: [null, couponUser],
        },
      });
      if (!couponEntity) {
        throw new BadRequestException('Coupon not found.');
      }

      user.point -= Math.abs(couponEntity.point);
      await this.userRepository.save(user);

      return couponEntity;
    } catch (error) {
      return error;
    }
  }

  async discountReceive(userId: string, money: number) {
    try {
      money = Math.abs(Number(money));
      const currentDate = new Date();
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) throw new BadRequestException('User not found');

      if (user.point < money)
        throw new BadRequestException('User point not enough');
      user.point -= money;
      await this.userRepository.save(user);

      const couponDto = new CouponDto();
      couponDto.isPromotion = true;
      couponDto.appliesOnce = false;
      couponDto.code = StringUtils.random(6);
      couponDto.startsAt = currentDate.toDateString();
      // couponDto.endsAt = data.endDate.toDateString();
      couponDto.minimumOrderAmount = 0;
      couponDto.usageLimit = 1;
      couponDto.value = money;
      couponDto.discountType = ECouponDiscountType.fixedAmount;
      // couponDto.variants = data.variants;
      couponDto.setTimeActive = true;
      // couponDto.appliesCustomerGroupId = data.appliesCustomerGroupId;
      // couponDto.locationIds = data.locationIds;

      const couponHaravan = await this.createCoupon(couponDto);

      const noti = new Notification();
      noti.title = 'Đổi mã giảm giá';
      noti.receiver = user;
      noti.type = NotificationType.coupon;
      noti.description = `Đổi mã: <b>${couponHaravan.code}</b> với giá trị: ${money.toLocaleString('vi')} đ thành công`;

      await this.notificationRepository.save(noti);

      return couponHaravan;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
