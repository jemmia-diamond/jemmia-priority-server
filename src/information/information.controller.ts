import { Controller, Get, Param } from '@nestjs/common';
import { InformationService } from './information.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Information')
@Controller('information')
export class InformationController {
  constructor(private informationService: InformationService) {}

  @Get('countries')
  async getCountries() {
    return this.informationService.getCountries();
  }

  @Get('countries/:countryId/provinces')
  async getProvinces(@Param('countryId') countryId: string) {
    return this.informationService.getProvinces(countryId);
  }

  @Get('provinces/:provinceId/districts')
  async getDistricts(@Param('provinceId') provinceId: string) {
    return this.informationService.getDistricts(provinceId);
  }

  @Get('districts/:districtId/wards')
  async getWards(@Param('districtId') districtId: string) {
    return this.informationService.getWards(districtId);
  }
}
