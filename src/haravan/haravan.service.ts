import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  HaravanCustomerDto,
  HaravanCustomerSearchDto,
} from './dto/haravan-customer.dto';
import { validate } from 'class-validator';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { HaravanBlogDto } from './dto/haravan-blog.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';

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
    await validate(data);

    // console.log(instanceToPlain(
    //   Object.setPrototypeOf(data, HaravanCustomerDto.prototype),
    // ));

    const res = await ax.post(`/com/customers.json`, {
      customer: instanceToPlain(
        Object.setPrototypeOf(data, HaravanCustomerDto.prototype),
      ),
    });

    return plainToInstance(HaravanCustomerDto, res.data.customer);
  }

  /** Update thông tin khách hàng */
  async updateCustomer(customerId: number, data: HaravanCustomerDto) {
    await validate(data);

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
  async createBlog(data: HaravanBlogDto) {
    await validate(data);

    const res = await ax.post(`/web/blogs/`+data.blogId+`/articles.json`, {
      blog: instanceToPlain(
        Object.setPrototypeOf(data, HaravanBlogDto.prototype),
      ),
    });

    return plainToClass(HaravanBlogDto, res.data.blog);
  }

  //#endregion
}
