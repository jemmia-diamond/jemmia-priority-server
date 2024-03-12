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

const ax = axios.create({
  baseURL: process.env.HARAVAN_ENDPOINT,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.HARAVAN_SECRET}`,
  },
});

@Injectable()
export class HaravanService {
  constructor() {}

  //*CUSTOMERS
  //#region
  /** List toàn bộ khách hàng đang có trên haravan
   * @param {string} query - Sử dụng field này để tìm kiếm trên data khách hàng */
  async findAllCustomer(query: HaravanCustomerSearchDto) {
    await validate(query);

    query = instanceToPlain(
      Object.setPrototypeOf(query, HaravanCustomerDto.prototype),
    );

    const res = await ax.get(
      `/com/customers.json?${new URLSearchParams(query as any)}`,
    );

    return plainToInstance(HaravanCustomerDto, <any[]>res.data.customers);
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

  /** Tạo blog mới */
  async createBlog(data: HaravanBlogDto, blogId: number) {
    await validate(data);

    console.log(data);

    const res = await ax.post(`/web/blogs/${blogId}/articles.json`, {
      article: instanceToPlain(
        Object.setPrototypeOf(data, HaravanBlogDto.prototype),
      ),
    });

    return plainToInstance(HaravanBlogDto, res.data.article);
  }

  /** Update blog */
  async updateBlog(data: HaravanBlogDto, blogId: number) {
    await validate(data);

    console.log(data);

    const res = await ax.put(`/web/blogs/${blogId}/articles/${data.id}.json`, {
      article: instanceToPlain(
        Object.setPrototypeOf(data, HaravanBlogDto.prototype),
      ),
    });

    return plainToInstance(HaravanBlogDto, res.data.article);
  }

  /** Delete blog */
  async deleteBlog(id: number, blogId: number) {

    const res = await ax.delete(`/web/blogs/${blogId}/articles/${id}.json`);

    return res.data;
  }

  /** Get one blog */
  async getBlog(id: number, blogId: number) {

    const res = await ax.get(`/web/blogs/${blogId}/articles/${id}.json`);

    return res.data;
  }

  /** List toàn bộ bài viết đang có trên haravan
  @param {string} query - Sử dụng field này để tìm kiếm trên data bài viết */
  async findAllBlog(query: HaravanBlogSearchDto, blogId: number) {
    await validate(query);

    query = instanceToPlain(
      Object.setPrototypeOf(query, HaravanBlogDto.prototype),
    );

    const res = await ax.get(
      `/web/blogs/${blogId}/articles.json?${new URLSearchParams(query as any)}`,
    );

    return plainToInstance(HaravanBlogDto, <any[]>res.data.articles);
  }

  //#endregion

  //*SHIPPING AND FULLFILMENT
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
}
