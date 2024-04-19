import { Expose, Transform } from 'class-transformer';

export class CrmCustomerDto {
  id: string;

  @Expose({ name: 'ma_khach_hang' })
  maKhachHang: string;

  address1: string;

  @Expose({ name: 'gioi_tinh' })
  gioiTinh: Array<{
    value: string;
    label: string;
    id: string;
  }>;

  @Expose({ name: 'haravan_id' })
  @Transform((value) => (value.value ? Number(value.value) : null))
  haravanId?: number;

  name: {
    value: string;
  };

  phones: Array<{
    value: string;
    hide: string;
  }>;

  emails: Array<{
    value: string;
    hide: string;
  }>;

  @Expose({ name: 'sinh_nhat' })
  sinhNhat: string;

  @Expose({ name: '_customer_rank' })
  _customerRank?: number;

  @Expose({ name: 'customer_rank' })
  customerRank?: Array<{
    label: string;
    value: string;
    id: string;
  }>;

  @Expose({ name: 'total_buyback_value' })
  totalBuybackValue: number;

  @Expose({ name: 'total_order_value' })
  totalOrderValue: number;

  @Expose({ name: 'tong_gia_tri_thu_mua_2' })
  tongGiaTriThuMua2: number;

  @Expose({ name: 'past_order_value' })
  postOrderValue: number;

  @Expose({ name: 'created_at' })
  createdAt: number;

  @Expose({ name: 'cumulative_tov_recorded' })
  cumulativeTovRecorded: number;

  @Expose({ name: 'cumulative_tov_referral' })
  cumulativeTovReferral: number;
}
