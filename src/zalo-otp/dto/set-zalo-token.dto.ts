// dto/set-zalo-token.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class SetZaloTokenDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 3500,
  })
  expires_in: number; // seconds

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Refresh token expiration time in seconds',
    example: 2592000,
  })
  refresh_token_expires_in: number; // seconds

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Zalo access token',
  })
  access_token: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Zalo refresh token',
  })
  refresh_token: string;
}
