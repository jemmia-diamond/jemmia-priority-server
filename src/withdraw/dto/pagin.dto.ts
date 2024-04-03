import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class BodyReqPaginDto {
  @IsNumber()
  @ApiProperty()
  page: number;

  @IsNumber()
  @ApiProperty()
  size?: number = 10;
}
