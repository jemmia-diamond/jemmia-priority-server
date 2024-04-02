import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class OrderQueryDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsNumber()
  page: number;

  @ApiProperty()
  @IsNumber()
  limit: number;
}
