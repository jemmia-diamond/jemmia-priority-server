import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserUpdateProfileDto {
  @ApiProperty()
  @IsString()
  @MaxLength(128)
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsPhoneNumber()
  @MaxLength(24)
  @MinLength(10)
  phoneNumber?: string;

  /** Mã invite code được user khác mời */
  @ApiProperty()
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  @Length(6, 6)
  invitedByCode?: string;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  socialTwitterUrl?: string;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  socialFbUrl?: string;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  kycFaceImageUrl?: string;
}

export class UserUpdateCrmInfoDto {
  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  birthday: string;
}
