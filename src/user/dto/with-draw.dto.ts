import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

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
}
