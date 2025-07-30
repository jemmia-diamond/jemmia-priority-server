import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @ApiProperty({
    description: 'Phone number to send OTP',
    example: '84367134806',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;
}
export class VerifyOtpDto {
  @IsString()
  @ApiProperty({
    description: 'Phone number to verify OTP',
    example: '84367134806',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;

  @IsString()
  @ApiProperty({ description: 'OTP to verify' })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string;
}
