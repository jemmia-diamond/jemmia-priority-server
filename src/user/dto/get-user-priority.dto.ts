import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserPriorityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  haravanId: string;
}

export class ReturnUserPriorityDto extends GetUserPriorityDto {
  @ApiProperty({ example: 500000 })
  totalReferAmount: number;

  @ApiProperty({ example: 100000 })
  totalCashBack: number;

  @ApiProperty({ example: 200000 })
  withdrawAmount: number;
}
