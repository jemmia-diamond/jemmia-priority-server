import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Length } from 'class-validator';
import { EWithdrawStatus } from './withdraw-status.dto';

export class UpdateWithDrawDto {
  @ApiProperty()
  @IsString()
  @Length(36, 36)
  withdrawRequestId: string;

  @ApiProperty()
  @IsString()
  @Length(36, 36)
  userId: string;

  @ApiProperty()
  @IsEnum(EWithdrawStatus)
  status: EWithdrawStatus;
}
