import { BadRequestException, Injectable } from '@nestjs/common';
import { HaravanService } from '../haravan/haravan.service';
import { CouponDto, CouponSearchDto } from './dto/coupon.dto';
import { CouponServerDto } from './dto/coupon-server.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
import { ECouponType } from './enums/coupon-type.enum';
import { User } from '../user/entities/user.entity';
import { CouponUser } from './entities/coupon-user.entity';
import { validate } from 'class-validator';
import { ECouponDiscountType } from '../haravan/enums/coupon.enum';
import { Pagination } from 'nestjs-typeorm-paginate';
import { EUserRole } from '../user/enums/user-role.enum';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CouponUser)
    private couponUserRepository: Repository<CouponUser>,
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

  async findAllCouponServer(
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
            couponUser: In([null, couponUser]),
          },
          order: { createdDate: 'DESC' },
          skip: offset,
          take: limit,
          join: {
            alias: 'coupon',
            leftJoinAndSelect: {
              couponUser: 'coupon.couponUser',
            },
          },
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

  async findCouponServerById(
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
            quantityLimit: MoreThanOrEqual(0),
            couponUser: In([null, couponUser]),
          },
          join: {
            alias: 'coupon',
            leftJoinAndSelect: {
              couponUser: 'coupon.couponUser',
            },
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

  async createCouponServer(data: CouponServerDto) {
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
        const couponServer = await queryRunner.manager.save(couponEntity);

        const promises = data.userList.map(async (userId) => {
          const user = await this.userRepository.findOneBy({ id: userId });
          if (!user) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException('User not found.');
          }

          const couponUser = new CouponUser();
          couponUser.user = user;
          couponUser.coupon = couponServer;

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

  async updateCouponServer(id: string, data: CouponServerDto) {
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
        const couponServer = await queryRunner.manager.save(couponEntity);

        await this.couponUserRepository.delete({
          coupon: couponServer,
        });

        const promises = data.userList.map(async (userId) => {
          const user = await this.userRepository.findOneBy({ id: userId });
          if (!user) {
            await queryRunner.rollbackTransaction();
            throw new BadRequestException('User not found.');
          }

          const couponUser = new CouponUser();
          couponUser.user = user;
          couponUser.coupon = couponServer;

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

  async deleteCouponServer(id: string) {
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
}
