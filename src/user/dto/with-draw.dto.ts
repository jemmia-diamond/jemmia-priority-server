import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
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
  bankName: string;

  @ApiProperty()
  @IsNumber()
  @Min(500000)
  amount: number;
}
