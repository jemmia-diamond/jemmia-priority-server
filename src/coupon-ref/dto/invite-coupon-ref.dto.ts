import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from '../../user/enums/user-role.enum';
import { IsEnum, IsUUID } from 'class-validator';

export class InviteCouponRefDto {
  @ApiProperty()
  @IsUUID()
  ownerId: string;

  @ApiProperty()
  @IsEnum(EUserRole)
  role: EUserRole;
}
