import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomerConfig } from './customer.config';

@Injectable()
export class ConfigCustomService {
  constructor(private configService: ConfigService) {}

  getConfig(): any {
    return CustomerConfig;
  }
}
