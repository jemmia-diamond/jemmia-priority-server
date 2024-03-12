import { Injectable } from '@nestjs/common';
import { HaravanService } from '../haravan/haravan.service';

@Injectable()
export class InformationService {
  constructor(private readonly haravanService: HaravanService) {}

  async getCountries() {
    try {
      return {
        countries: await this.haravanService.getCountries(),
      };
    } catch (e) {
      return e;
    }
  }

  async getProvinces(countryId: string) {
    try {
      return {
        provinces: await this.haravanService.getProvinces(countryId),
      };
    } catch (e) {
      return e;
    }
  }

  async getDistricts(provinceId: string) {
    try {
      return {
        districts: await this.haravanService.getDistricts(provinceId),
      };
    } catch (e) {
      return e;
    }
  }

  async getWards(districtId: string) {
    try {
      return {
        wards: await this.haravanService.getWards(districtId),
      };
    } catch (e) {
      return e;
    }
  }
}
