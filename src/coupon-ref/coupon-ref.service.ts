import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCouponRefDto } from './dto/create-coupon-ref.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { In, Repository } from 'typeorm';
import { CouponService } from '../coupon/coupon.service';
import { CouponRef } from './entities/coupon-ref.entity';
import { HaravanCouponDto } from '../haravan/dto/haravan-coupon.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { EPartnerCashbackConfig } from './enums/partner-customer.enum';
import { StringUtils } from '../shared/utils/string.utils';
import { ECouponDiscountType } from '../haravan/enums/coupon.enum';
import { HaravanService } from '../haravan/haravan.service';
import { InviteCouponRefDto } from './dto/invite-coupon-ref.dto';
import { validate } from 'class-validator';
import { ECouponRefType } from './enums/coupon-ref.enum';
import { EUserRole } from '../user/enums/user-role.enum';
import { Notification } from '../notification/entities/notification.entity';
import { NotificationType } from '../notification/enums/noti-type.enum';
import { HaravanCustomerDto } from '../haravan/dto/haravan-customer.dto';

@Injectable()
export class CouponRefService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CouponRef)
    private couponRefRepository: Repository<CouponRef>,
    private couponService: CouponService,
    private haravanService: HaravanService,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(createCouponRefDto: CreateCouponRefDto) {
    await validate(createCouponRefDto);

    let owner: User;
    let haravanOwner: HaravanCustomerDto;

    if (createCouponRefDto.ownerId) {
      owner = await this.userRepository.findOneBy({
        id: createCouponRefDto.ownerId,
      });

      haravanOwner = await this.haravanService.findCustomer(owner.haravanId);
    }

    // if (!owner) throw new BadRequestException('Customer not found');
    console.log(createCouponRefDto);
    const couponRef = new CouponRef();

    const couponHaravanDto = new HaravanCouponDto();
    couponHaravanDto.isPromotion = true;
    couponHaravanDto.code = StringUtils.random(6);
    couponHaravanDto.appliesOnce = true;
    couponHaravanDto.startsAt =
      createCouponRefDto.startDate?.toUTCString() || new Date().toUTCString();

    if (createCouponRefDto.endDate) {
      couponHaravanDto.endsAt = createCouponRefDto.endDate.toUTCString();
      couponRef.endDate = createCouponRefDto.endDate;
    }

    //TẠO MÃ INVITE COUPON
    couponHaravanDto.value =
      EPartnerCashbackConfig.firstBuyCashbackPercent.customer;
    couponHaravanDto.discountType = ECouponDiscountType.percentage;
    couponHaravanDto.setTimeActive = true;
    couponHaravanDto.maxAmountApply = null;

    if (createCouponRefDto.type == ECouponRefType.partner) {
      couponHaravanDto.usageLimit = 1;
      couponHaravanDto.value =
        EPartnerCashbackConfig.firstBuyCashbackPercent[createCouponRefDto.role];
    }

    const coupon = await this.haravanService.createCoupon(couponHaravanDto);

    couponRef.couponHaravanId = coupon.id;
    couponRef.couponHaravanCode = couponHaravanDto.code;
    couponRef.role = createCouponRefDto.role;
    couponRef.startDate = createCouponRefDto.startDate
      ? new Date(createCouponRefDto.startDate)
      : new Date();
    couponRef.owner = owner;
    couponRef.ownerName = `${haravanOwner?.lastName || ''} ${haravanOwner?.firstName || ''}`;
    couponRef.type = createCouponRefDto.type;
    couponRef.note = createCouponRefDto.note;

    if (owner) {
      const noti = new Notification();
      noti.title = 'Tạo mã mời';
      noti.receiver = owner;
      noti.type = NotificationType.ref;
      noti.description = `Đã tạo mã: <b>${couponHaravanDto.code}</b>`;

      await this.notificationRepository.save(noti);
    }

    return await this.couponRefRepository.save(couponRef);
  }

  // async convertPartnerToInvite(userId: string, couponHaravanCode: string) {
  //   const partnerCoupon = await this.couponRefRepository.findOneBy({
  //     couponHaravanCode,
  //   });

  //   if (!partnerCoupon) {
  //     throw new BadRequestException('Coupon not exists');
  //   }

  //   partnerCoupon.used = true;

  //   if (partnerCoupon.role == EUserRole.partnerA) {
  //     await this.couponRefRepository.save(partnerCoupon);

  //     return partnerCoupon;
  //   }

  //   let inviteCoupon = await this.couponRefRepository.findOneBy({
  //     owner: {
  //       id: userId,
  //     },
  //   });

  //   if (!inviteCoupon) {
  //     const owner = await this.userRepository.findOneBy({
  //       id: userId,
  //     });

  //     if (!owner) throw new BadRequestException('User not found');

  //     inviteCoupon = await this.createInvite({
  //       ownerId: userId,
  //       role: owner.role,
  //     });
  //   }

  //   inviteCoupon.partnerCoupon = partnerCoupon;
  //   inviteCoupon.role = partnerCoupon.role;

  //   await this.couponRefRepository.save(partnerCoupon);
  //   await this.couponRefRepository.save(inviteCoupon);

  //   return inviteCoupon;
  // }

  async createInvite(payload: InviteCouponRefDto) {
    await validate(payload);

    const dateNow = new Date();
    const haravanDateNow = dateNow;
    haravanDateNow.setHours(dateNow.getHours() + 7);

    const data = new CreateCouponRefDto();

    data.ownerId = payload.ownerId;
    data.role = payload.role;
    data.type = ECouponRefType.invite;
    data.startDate = haravanDateNow;
    data.endDate = new Date(
      haravanDateNow.setHours(haravanDateNow.getHours() + 3),
    );

    return await this.create(data);
  }

  async findAllInvite(
    userId: string,
    type: ECouponRefType,
    used: boolean | null,
    page: number,
    limit: number,
  ): Promise<Pagination<CouponRef>> {
    try {
      let usedQuery;

      if (used == null) {
        usedQuery = In([true, false]);
      } else {
        usedQuery = In([used]);
      }

      const offset = (page - 1) * limit;
      const [items, totalItems] = await this.couponRefRepository.findAndCount({
        where: {
          type: type,
          owner: {
            id: userId,
          },
          used: usedQuery,
        },
        order: { createdDate: 'DESC' },
        skip: offset,
        take: limit,
        relations: ['owner', 'usedBy'],
      });

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

  async findAllCouponRef(
    userId: string,
    type: ECouponRefType,
    role: EUserRole,
    page: number,
    limit: number,
  ): Promise<Pagination<CouponRef>> {
    try {
      const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) throw new BadRequestException('User not found');

      const offset = (page - 1) * limit;
      let items: CouponRef[];
      let totalItems: number;

      if (user.role === EUserRole.admin) {
        [items, totalItems] = await this.couponRefRepository.findAndCount({
          where: {
            type: type,
            role: role,
          },
          order: { createdDate: 'DESC' },
          skip: offset,
          take: limit,
          relations: ['owner', 'usedBy'],
        });
      } else {
        [items, totalItems] = await this.couponRefRepository.findAndCount({
          where: {
            type: type,
            role: role,
            owner: user,
          },
          order: { createdDate: 'DESC' },
          skip: offset,
          take: limit,
          relations: ['owner', 'usedBy'],
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

  async findAllInvitePartner(
    userId: string,
    type: ECouponRefType,
    page: number,
    limit: number,
    used: boolean,
  ): Promise<Pagination<CouponRef>> {
    try {
      const offset = (page - 1) * limit;
      const [items, totalItems] = await this.couponRefRepository.findAndCount({
        where: {
          type: type,
          owner: {
            id: userId,
          },
          used,
        },
        order: { createdDate: 'DESC' },
        skip: offset,
        take: limit,
        relations: ['owner', 'usedBy'],
      });

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

  async findByHaravanCode(couponHaravanCode: string) {
    return await this.couponRefRepository.findOneBy({
      couponHaravanCode: couponHaravanCode,
    });
  }

  async update(couponRef: CouponRef) {
    return await this.couponRefRepository.save(couponRef);
  }
}
