import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EAuthType } from '../enums/auth-type.enum';

export class AuthDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ default: EAuthType.google, enum: EAuthType })
  @IsEnum(EAuthType)
  authType: EAuthType;

  @ApiProperty()
  @IsString()
  @MaxLength(128)
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsPhoneNumber()
  @MaxLength(24)
  @MinLength(10)
  @IsOptional()
  phoneNumber?: string;
}
