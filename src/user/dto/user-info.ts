import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HaravanCustomerDto } from '../../haravan/dto/haravan-customer.dto';

export class UserBankingAccountDto {
  @ApiProperty()
  number: string;

  @ApiProperty()
  bankName: string;
}

export class UserInfoDto extends HaravanCustomerDto {
  @ApiPropertyOptional()
  bankingAccount?: UserBankingAccountDto;

  @ApiPropertyOptional()
  frontIDCardImageUrl: string;

  @ApiPropertyOptional()
  backIDCardImageUrl: string;
}
