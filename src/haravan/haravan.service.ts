import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  HaravanCustomerDto,
  HaravanCustomerSearchDto,
} from './dto/haravan-customer.dto';
import { validate } from 'class-validator';
import { HaravanBlogDto, HaravanBlogSearchDto } from './dto/haravan-blog.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import {
  HaravanCountryDto,
  HaravanDistrictDto,
  HaravanProvinceDto,
  HaravanWardDto,
} from './dto/haravan-shipping.dto';
import { EBlogType } from '../blog/enums/blog-type.enum';
import {
  HaravanCouponDto,
  HaravanCouponSearchDto,
} from './dto/haravan-coupon.dto';
import {
  HaravanOrderDto,
  HaravanOrderSearchDto,
} from './dto/haravan-order.dto';
import { PaymentType } from './enums/payment-type.enum';
import { GATEWAY_POS_TYPES } from './constants/gateway-type.const';

const ax = axios.create({
  baseURL: process.env.HARAVAN_ENDPOINT,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: `Bearer ${process.env.HARAVAN_SECRET}`,
  },
});
import { EUserRole } from '../user/enums/user-role.enum';

const PROMOTIONS = [];

@Injectable()
export class HaravanService {
  constructor() {}
  async bulkPromotion() {
    for (const p of PROMOTIONS) {
      await ax.post('/com/promotions.json', {
        promotion: {
          name: p['Tên chương trình khuyến mãi*'],
          starts_at: '2025-11-11T09:30:00.1Z',
          ends_at: '2025-11-23T23:50:00.1Z',
          value: Number(p['Giá trị giảm*']),
          discount_type: 'same_price',
          applies_to_quantity: 1,
          products_selection: 'variant_prerequisite',
          showOnWebsite: true,
          entitled_variant_ids: [Number(p['Variant ID'])],
          locations_selection: 'all',
        },
      });
    }
  }

  //*COUPON
  //#region
  async createCoupon(data: HaravanCouponDto) {
    await validate(data, { whitelist: true });

    const res = await ax.post(`/com/discounts.json`, {
      discount: instanceToPlain(
        Object.setPrototypeOf(data, HaravanCouponDto.prototype),
      ),
    });

    return plainToInstance(HaravanCouponDto, res.data.discount);
  }

  async updateCoupon(data: HaravanCouponDto) {
    await validate(data, { whitelist: true });

    const res = await ax.put(`/com/discounts/${data.id}.json`, {
      discount: instanceToPlain(
        Object.setPrototypeOf(data, HaravanCouponDto.prototype),
      ),
    });

    return plainToInstance(HaravanCouponDto, res.data.discount);
  }

  async toggleStatus(couponId: number, enable: boolean) {
    const res = await ax.put(
      `/com/discounts/${couponId}/${enable ? 'enable' : 'disable'}.json`,
      {},
    );

    return plainToInstance(HaravanCouponDto, res.data.discount);
  }

  async deleteCoupon(couponId: number) {
    await ax.delete(`/com/discounts/${couponId}.json`);

    return;
  }

  async findCoupon(couponId: number) {
    const res = await ax.get(`/com/discounts/${couponId}.json`);

    return plainToInstance(HaravanCouponDto, res.data.discount);
  }

  async findPaymentMethod(orderId: number) {
    const res = await ax.get(`/com/payment_methods.json`);

    return res.data.payment_methods;
  }

  async findAllCoupon(query: HaravanCouponSearchDto) {
    await validate(query, { whitelist: true });

    query = instanceToPlain(
      Object.setPrototypeOf(query, HaravanCouponSearchDto.prototype),
    );

    const res = await ax.get(
      `/com/discounts.json?${new URLSearchParams(query as any)}`,
    );

    return plainToInstance(HaravanCouponDto, <any[]>res.data.discounts);
  }
  //#endregion

  //*BLOG
  //#region
  /** Tạo blog mới */
  async createBlog(data: HaravanBlogDto) {
    await validate(data, { whitelist: true });

    const res = await ax.post(`/web/blogs/${data.blogId}/articles.json`, {
      article: instanceToPlain(
        Object.setPrototypeOf(data, HaravanBlogDto.prototype),
      ),
    });

    return plainToInstance(HaravanBlogDto, res.data.article);
  }

  /** Update blog */
  async updateBlog(data: HaravanBlogDto) {
    await validate(data, { whitelist: true });

    const res = await ax.put(
      `/web/blogs/${data.blogId}/articles/${data.id}.json`,
      {
        article: instanceToPlain(
          Object.setPrototypeOf(data, HaravanBlogDto.prototype),
        ),
      },
    );

    return plainToInstance(HaravanBlogDto, res.data.article);
  }

  /** Delete blog */
  async deleteBlog(id: number, blogType: EBlogType) {
    await ax.delete(`/web/blogs/${blogType}/articles/${id}.json`);

    return;
  }

  /** Get one blog */
  async getBlog(id: number, blogType: EBlogType) {
    const res = await ax.get(`/web/blogs/${blogType}/articles/${id}.json`);

    return plainToInstance(HaravanBlogDto, res.data.article);
  }

  /** List toàn bộ bài viết đang có trên haravan
  @param {string} query - Sử dụng field này để tìm kiếm trên data bài viết */
  async findAllBlog(query: HaravanBlogSearchDto) {
    await validate(query, { whitelist: true });

    query = instanceToPlain(
      Object.setPrototypeOf(query, HaravanBlogSearchDto.prototype),
    );

    const res = await ax.get(
      `/web/blogs/${query.blogId}/articles.json?${new URLSearchParams(query as any)}`,
    );

    return plainToInstance(HaravanBlogDto, <any[]>res.data.articles);
  }
  //#endregion

  //*CUSTOMERS
  //#region
  /** List toàn bộ khách hàng đang có trên haravan
   * @param {string} query - Sử dụng field này để tìm kiếm trên data khách hàng */
  async findAllCustomer(query: HaravanCustomerSearchDto) {
    await validate(query);

    query = instanceToPlain(
      Object.setPrototypeOf(query, HaravanCustomerSearchDto.prototype),
    );

    const res = await ax.get(
      `/com/customers.json?${new URLSearchParams(query as any)}`,
    );

    return plainToInstance(HaravanCustomerDto, <any[]>res.data.customers);
  }

  /** Đếm số lượng toàn bộ khách hàng đang có trên haravan */
  async countAllCustomer(): Promise<number> {
    const res = await ax.get(`/com/customers/count.json`);

    return res.data?.count || 0;
  }

  /** Tìm kiếm khách hàng dựa trên ID */
  async findCustomer(customerId: number) {
    const res = await ax.get(`/com/customers/${customerId}.json`);

    return plainToInstance(HaravanCustomerDto, res.data.customer);
  }

  /** Tạo khách hàng mới */
  async createCustomer(data: HaravanCustomerDto) {
    await validate(data, {
      whitelist: true,
    });

    const res = await ax.post(`/com/customers.json`, {
      customer: instanceToPlain(
        Object.setPrototypeOf(data, HaravanCustomerDto.prototype),
      ),
    });

    return plainToInstance(HaravanCustomerDto, res.data.customer);
  }

  /** Update thông tin khách hàng */
  async updateCustomer(customerId: number, data: HaravanCustomerDto) {
    await validate(data, {
      whitelist: true,
    });

    const res = await ax.put(`/com/customers/${customerId}.json`, {
      customer: instanceToPlain(
        Object.setPrototypeOf(data, HaravanCustomerDto.prototype),
      ),
    });

    return plainToInstance(HaravanCustomerDto, res.data.customer);
  }

  /** Thêm tags vào khách hàng */
  async addCustomerTags(customerId: number, tags: string[]) {
    const res = await ax.post(`/com/customers/${customerId}/tags.json`, {
      tags: tags.join(','),
    });

    return plainToInstance(HaravanCustomerDto, res.data.customer);
  }
  //#endregion

  //*SHIPPING AND FULLFILMENT
  //#region
  async getCountries() {
    const res = await ax.get(`/com/countries.json`);

    return plainToInstance(HaravanCountryDto, res.data.countries);
  }

  async getProvinces(countryId: string) {
    const res = await ax.get(`/com/countries/${countryId}/provinces.json`);

    return plainToInstance(HaravanProvinceDto, res.data.provinces);
  }

  async getDistricts(provinceId: string) {
    const res = await ax.get(`/com/provinces/${provinceId}/districts.json`);

    return plainToInstance(HaravanDistrictDto, res.data.districts);
  }

  async getWards(districtId: string) {
    const res = await ax.get(`/com/districts/${districtId}/wards.json`);

    return plainToInstance(HaravanWardDto, res.data.wards);
  }
  //#endregion

  //*Order
  /** List toàn bộ order đang có trên haravan
   * @param {string} query - Sử dụng field này để tìm kiếm trên data order */
  async findAllOrder(query: HaravanOrderSearchDto) {
    await validate(query, { whitelist: true });

    query = instanceToPlain(
      Object.setPrototypeOf(query, HaravanOrderSearchDto.prototype),
    );

    const res = await ax.get(
      `/com/orders.json?${new URLSearchParams(query as any)}`,
    );

    return plainToInstance(HaravanOrderDto, <any[]>res.data.orders);
  }

  /** List order đang có trên haravan
   * @param {string} query - Sử dụng field này để tìm kiếm trên data order */
  async findOneOrder(query: HaravanOrderSearchDto, id: number) {
    await validate(query, { whitelist: true });

    query = instanceToPlain(
      Object.setPrototypeOf(query, HaravanOrderSearchDto.prototype),
    );

    const res = await ax.get(
      `/com/orders/${id}.json?${new URLSearchParams(query as any)}`,
    );

    return plainToInstance(HaravanOrderDto, <any>res.data.order);
  }

  async getPaymentType(haravanOrderId: number, role: string) {
    if (role !== EUserRole.affiliate) {
      return ''; //Only affiliates can have POS payment type
    }
    const res = await ax.get(`/com/orders/${haravanOrderId}/transactions.json`);

    const gateway = res.data?.transactions?.[0]?.gateway || '';
    if (GATEWAY_POS_TYPES.includes(gateway)) {
      return PaymentType.POS;
    }
    return '';
  }
}
