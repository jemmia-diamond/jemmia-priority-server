import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class WithdrawMoneyDto {
  @ApiProperty()
  @IsString()
  bankNumber: string;

  @ApiProperty()
  @IsString()
  bankName: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  remainAmount: number;
  withdrawPoint: number;
  withdrawCashAmount: number;
}
