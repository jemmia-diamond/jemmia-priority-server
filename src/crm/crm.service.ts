import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { createHmac } from 'crypto';
import { CrmQueryDto } from './dto/crm.dto';
import { validate } from 'class-validator';
import { CrmCustomerDto } from './dto/crm-customer.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';

const ax = axios.create({
  baseURL: process.env.CRM_ENDPOINT,
  timeout: 120000,
  headers: (() => {
    return {
      'Content-Type': 'application/json',
      'cb-access-key': process.env.CRM_API_KEY,
      'cb-project-token': process.env.CRM_PROJECT_TOKEN,
      'cb-access-sign': '',
    };
  })(),
});
// Intercept request để cập nhật timestamp và signature trước khi gửi request
ax.interceptors.request.use((config) => {
  const timestamp = Date.now();
  const hmac = createHmac('sha512', process.env.CRM_API_SECRET);

  const data = hmac.update(timestamp + process.env.CRM_PROJECT_TOKEN);
  const signature = data.digest('hex');

  // Cập nhật timestamp và signature vào header
  config.headers['cb-access-timestamp'] = timestamp;
  config.headers['cb-access-sign'] = signature;

  return config;
});

@Injectable()
export class CrmService {
  constructor() {}

  //*CUSTOMER
  //#region CUSTOMER
  async findAllCustomer(query: CrmQueryDto): Promise<{
    data: CrmCustomerDto[];
    limit: number;
    total: number;
  }> {
    await validate(query);

    query.limit = query.limit || 1;
    query.output = query.output || 'original';
    query.table = 'data_customer';

    const body = instanceToPlain(
      Object.setPrototypeOf(query, CrmQueryDto.prototype),
    );

    const res = await ax.post(`/_api/base-table/find`, body);

    console.log('RESULT');
    console.log(res);

    return {
      data: plainToInstance(CrmCustomerDto, <any[]>res.data.data),
      limit: res.data.limit,
      total: res.data.total,
    };
  }

  async updateCustomer(
    id: string,
    fields: Array<{
      key: string;
      value: any;
    }>,
  ) {
    const body = {
      table: 'data_customer',
      data: [
        {
          id: id,
          fields: fields,
        },
      ],
    };

    const res = await ax.post(`/_api/base-table/update`, body);

    return res.data;
  }

  //#endregion
}
