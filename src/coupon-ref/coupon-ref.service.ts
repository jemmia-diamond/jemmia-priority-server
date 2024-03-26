import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCouponRefDto } from './dto/create-coupon-ref.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { CouponService } from '../coupon/coupon.service';
import { CouponRef } from './entities/coupon-ref.entity';
import { HaravanCouponDto } from '../haravan/dto/haravan-coupon.dto';
import { EUserRole } from '../user/enums/user-role.enum';
import { Pagination } from 'nestjs-typeorm-paginate';
import { EPartnerInviteCouponConfig } from './enums/partner-customer.enum';
import { StringUtils } from '../utils/string.utils';
import { ECouponDiscountType } from '../haravan/enums/coupon.enum';
import { HaravanService } from '../haravan/haravan.service';
import { InviteCouponRefDto } from './dto/invite-coupon-ref.dto';
import { validate } from 'class-validator';
import { ECouponRefType } from './enums/coupon-ref.enum';

@Injectable()
export class CouponRefService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CouponRef)
    private couponRefRepository: Repository<CouponRef>,
    private couponService: CouponService,
    private haravanService: HaravanService,
  ) {}

  async create(createCouponRefDto: CreateCouponRefDto) {
    await validate(createCouponRefDto);

    const owner = await this.userRepository.findOneBy({
      id: createCouponRefDto.ownerId,
    });

    if (!owner) throw new BadRequestException('Customer not found');

    const couponRef = new CouponRef();

    const couponHaravanDto = new HaravanCouponDto();
    couponHaravanDto.isPromotion = true;
    couponHaravanDto.code = StringUtils.random(6);
    couponHaravanDto.appliesOnce = true;
    couponHaravanDto.startsAt =
      createCouponRefDto.startDate || new Date().toISOString();
    couponHaravanDto.value = 1;
    couponHaravanDto.discountType = ECouponDiscountType.shipping;

    //CREATE PARTNER COUPON
    if (createCouponRefDto.type == ECouponRefType.partner) {
      const couponConfig = EPartnerInviteCouponConfig[createCouponRefDto.role];

      if (!couponConfig)
        throw new BadRequestException('Partner customer not found');

      couponHaravanDto.endsAt = createCouponRefDto.endDate;
      couponHaravanDto.usageLimit = 1;
      couponHaravanDto.value = couponConfig.value;
      couponHaravanDto.discountType = couponConfig.discountType;
      couponHaravanDto.setTimeActive = true;
    }

    const coupon = await this.haravanService.createCoupon(couponHaravanDto);

    couponRef.couponHaravanId = coupon.id;
    couponRef.couponHaravanCode = couponHaravanDto.code;
    couponRef.role = createCouponRefDto.role;
    couponRef.startDate = new Date(createCouponRefDto.startDate);
    couponRef.endDate = new Date(createCouponRefDto.endDate);
    couponRef.owner = owner;
    couponRef.type = createCouponRefDto.type;

    return await this.couponRefRepository.save(couponRef);
  }

  async convertPartnerToInvite(userId: string, couponHaravanCode: string) {
    const partnerCoupon = await this.couponRefRepository.findOneBy({
      couponHaravanCode,
    });

    if (!partnerCoupon) {
      throw new BadRequestException('Coupon not exists');
    }

    partnerCoupon.used = true;

    if (partnerCoupon.role == EUserRole.partnerA) {
      await this.couponRefRepository.save(partnerCoupon);

      return partnerCoupon;
    }

    let inviteCoupon = await this.couponRefRepository.findOneBy({
      owner: {
        id: userId,
      },
    });

    if (!inviteCoupon) {
      const owner = await this.userRepository.findOneBy({
        id: userId,
      });

      if (!owner) throw new BadRequestException('User not found');

      inviteCoupon = await this.createInvite({
        ownerId: userId,
        role: owner.role,
      });
    }

    inviteCoupon.partnerCoupon = partnerCoupon;
    inviteCoupon.role = partnerCoupon.role;

    await this.couponRefRepository.save(partnerCoupon);
    await this.couponRefRepository.save(inviteCoupon);

    return inviteCoupon;
  }

  async createInvite(payload: InviteCouponRefDto) {
    await validate(payload);

    const couponRef = await this.couponRefRepository.findOneBy({
      owner: {
        id: payload.ownerId,
      },
    });

    if (couponRef) {
      return couponRef;
    }

    const data = new CreateCouponRefDto();

    data.startDate = new Date().toISOString();
    data.ownerId = payload.ownerId;
    data.role = payload.role;

    return await this.create(data);
  }

  async findAllInvitePartner(
    userId: string,
    role: string,
    page: number,
    limit: number,
  ): Promise<Pagination<CouponRef>> {
    try {
      const offset = (page - 1) * limit;
      let items: CouponRef[];
      let totalItems: number;

      if (role === EUserRole.admin) {
        [items, totalItems] = await this.couponRefRepository.findAndCount({
          where: {
            type: ECouponRefType.partner,
          },
          order: { createdDate: 'DESC' },
          skip: offset,
          take: limit,
        });
      } else {
        [items, totalItems] = await this.couponRefRepository.findAndCount({
          where: {
            type: ECouponRefType.partner,
            owner: {
              id: userId,
            },
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

  async findInvite(userId: string) {
    const couponRef = await this.couponRefRepository.findOneBy({
      owner: {
        id: userId,
      },
      type: ECouponRefType.invite,
    });

    return couponRef;
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
