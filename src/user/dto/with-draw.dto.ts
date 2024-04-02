import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class WithdrawMoneyDto {
  @ApiProperty()
  @IsString()
  @MinLength(13)
  @MaxLength(15)
  bankNumber: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(4)
  bankCode: string;

  @ApiProperty()
  @IsNumber()
  @Min(10)
  @Max(20000000)
  amount: number;
}
