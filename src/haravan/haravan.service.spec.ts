import { Test, TestingModule } from '@nestjs/testing';
import { HaravanService } from './haravan.service';

describe('HaravanService', () => {
  let service: HaravanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HaravanService],
    }).compile();

    service = module.get<HaravanService>(HaravanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
