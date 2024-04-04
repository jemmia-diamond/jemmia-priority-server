import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class OrderQueryDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
