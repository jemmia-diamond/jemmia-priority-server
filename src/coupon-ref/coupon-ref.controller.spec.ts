import { Test, TestingModule } from '@nestjs/testing';
import { CouponRefController } from './coupon-ref.controller';
import { CouponRefService } from './coupon-ref.service';

describe('CouponRefController', () => {
  let controller: CouponRefController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponRefController],
      providers: [CouponRefService],
    }).compile();

    controller = module.get<CouponRefController>(CouponRefController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
