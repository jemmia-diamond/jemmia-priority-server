import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCouponRefDto } from './dto/create-coupon-ref.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { CouponService } from '../coupon/coupon.service';
import { CouponRef } from './entities/coupon-ref.entity';
import { ConfigCustomService } from '../config/config-custom.service';
import { HaravanCouponDto } from '../haravan/dto/haravan-coupon.dto';
import { EUserRole } from '../user/enums/user-role.enum';
import { Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class CouponRefService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CouponRef)
    private couponRefRepository: Repository<CouponRef>,
    private couponService: CouponService,
    private configService: ConfigCustomService,
  ) {}

  async create(createCouponRefDto: CreateCouponRefDto) {
    try {
      const owner = await this.userRepository.findOneBy({
        id: createCouponRefDto.owner,
      });
      if (!owner) throw new BadRequestException('User owner not found');

      const dataCustomerConfig =
        this.configService.getConfig()[createCouponRefDto.partnerCustomer];

      if (!dataCustomerConfig)
        throw new BadRequestException('Partner customer not found');

      const dataCouponConfig = this.configService.getConfig().partnerCoupon;

      const couponHaravanDto = new HaravanCouponDto();
      couponHaravanDto.isPromotion = true;
      couponHaravanDto.appliesOnce = false;
      couponHaravanDto.code = createCouponRefDto.code;
      couponHaravanDto.endsAt = createCouponRefDto.endDate.toDateString();
      couponHaravanDto.startsAt = createCouponRefDto.startDate.toDateString();
      couponHaravanDto.minimumOrderAmount = dataCouponConfig.minimumOrderAmount;
      couponHaravanDto.usageLimit = dataCouponConfig.usageLimit;
      couponHaravanDto.value = dataCouponConfig.value;
      couponHaravanDto.discountType = dataCouponConfig.discountType;
      couponHaravanDto.variants = createCouponRefDto.variants;
      couponHaravanDto.setTimeActive = true;
      couponHaravanDto.appliesCustomerGroupId =
        createCouponRefDto.appliesCustomerGroupId;
      couponHaravanDto.locationIds = createCouponRefDto.locationIds;

      const coupon = await this.couponService.createCoupon(couponHaravanDto);

      const couponRef = new CouponRef();
      couponRef.couponHaravanId = coupon.id;
      couponRef.name = dataCustomerConfig.name;
      couponRef.owner = owner;
      couponRef.percentReduce = dataCustomerConfig.percent;
      couponRef.receiveRankPoint = dataCustomerConfig.receiveRankPoint;
      couponRef.startDate = createCouponRefDto.startDate;
      couponRef.endDate = createCouponRefDto.endDate;
      couponRef.startDateHaravan = createCouponRefDto.startDate;
      couponRef.endDateHaravan = createCouponRefDto.endDate;

      return await this.couponRefRepository.save(couponRef);
    } catch (error) {
      return error;
    }
  }

  async findAll(
    userId: string,
    role: string,
    page: number,
    limit: number,
  ): Promise<Pagination<CouponRef>> {
    try {
      const offset = (page - 1) * limit;
      let items: CouponRef[];
      let totalItems: number;

      const owner = await this.userRepository.findOneBy({ id: userId });

      if (role === EUserRole.admin) {
        [items, totalItems] = await this.couponRefRepository.findAndCount({
          order: { createdDate: 'DESC' },
          skip: offset,
          take: limit,
        });
      } else {
        [items, totalItems] = await this.couponRefRepository.findAndCount({
          where: {
            owner: owner,
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

      return new Pagination<CouponRef>(items, meta);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const couponRef = await this.couponRefRepository.findOneBy({ id: id });
      if (!couponRef) throw new BadRequestException('Coupon Ref not found');

      await this.couponService.deleteCoupon(couponRef.couponHaravanId);
      return await this.couponRefRepository.remove(couponRef);
    } catch (error) {
      return error;
    }
  }
}
