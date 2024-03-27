import { Test, TestingModule } from '@nestjs/testing';
import { CouponRefService } from './coupon-ref.service';

describe('CouponRefService', () => {
  let service: CouponRefService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CouponRefService],
    }).compile();

    service = module.get<CouponRefService>(CouponRefService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
