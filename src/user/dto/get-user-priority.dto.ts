import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserPriorityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  haravanId: string;
}

export class ReturnUserPriorityDto extends GetUserPriorityDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @ApiProperty({
    example: 2,
    description: 'Rank: 0=none, 1=staff, 2=silver, 3=gold, 4=platinum',
  })
  rank: number;

  @ApiProperty({
    example: 'customer',
    description: 'Role: customer, partnerA, partnerB, affiliate, staff, admin',
  })
  role: string;

  @ApiProperty({ example: 500000 })
  totalReferAmount: number;

  @ApiProperty({ example: 100000 })
  totalCashBack: number;

  @ApiProperty({ example: 200000 })
  withdrawAmount: number;

  @ApiProperty({ example: 222222 })
  withdrawPoint: number;

  @ApiProperty({ example: 200000 })
  withdrawCashAmount: number;

  @ApiProperty({ example: 1500000, description: 'Cumulative Revenue (bought + ref)' })
  cumulativeRevenue: number;

  @ApiProperty({ example: 1000000, description: 'True Cumulative Revenue (bought)' })
  trueCumulativeRevenue: number;

  @ApiProperty({ example: 500000, description: 'Referrals Revenue (bought)' })
  referralsRevenue: number;

  @ApiProperty({ example: 50000, description: 'Pending Cashback' })
  pendingCashback: number;

  @ApiProperty({ example: 300000, description: 'Available Cashback Point' })
  pointAvailable: number;

  @ApiProperty({ example: 300000, description: 'Total Point' })
  totalPoint: number;
}
