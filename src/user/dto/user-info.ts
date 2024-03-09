import { ApiProperty } from '@nestjs/swagger';
import { HaravanCustomerDto } from '../../haravan/dto/haravan-customer.dto';
import { IsEnum } from 'class-validator';
import { EUserRole } from '../enums/user-role.enum';

export class UserInfoDto extends HaravanCustomerDto {
  @ApiProperty({
    enum: EUserRole,
  })
  @IsEnum(EUserRole)
  role: EUserRole;
}
