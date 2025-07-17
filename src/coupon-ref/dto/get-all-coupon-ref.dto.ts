import { ApiProperty } from '@nestjs/swagger';

export class GetCouponRefDto {
  @ApiProperty({ example: '1234567890' })
  haravanId: string;

  @ApiProperty({ example: 'Đặng Tuấn Kiệt' })
  ownerName: string;

  @ApiProperty({ example: 'HARAVAN12345' })
  couponHaravanCode: string;

  @ApiProperty({ example: 123456 })
  couponHaravanId: number;

  @ApiProperty({ example: 'paid' })
  paymentStatus: 'paid' | 'pending' | string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  usedByName: string;

  @ApiProperty({ example: 150000 })
  totalPrice: number;

  @ApiProperty({ example: 'REF-CB-2025-0001' })
  cashBackRef: string;
}
