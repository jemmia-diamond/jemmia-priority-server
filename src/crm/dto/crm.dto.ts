export class CrmQueryDto {
  table?: 'data_customer';
  limit?: number;
  skip?: number;
  sort?: any;
  output?: 'original' | 'default' | 'count-only' | 'by-key';
  query?: any;
}
