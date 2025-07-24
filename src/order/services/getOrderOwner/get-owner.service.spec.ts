import { OwnerService } from './get-owner.service';
import { Order } from '../../entities/order.entity';
import { User } from '../../../user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('OwnerService', () => {
  let service: OwnerService;
  let orderRepository: jest.Mocked<Repository<Order>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OwnerService>(OwnerService);
    orderRepository = module.get(getRepositoryToken(Order));
  });

  it('should return the user of the order', async () => {
    const mockUser = { id: 'u1', name: 'John Doe' } as User;
    const orderInput = { id: 'order123', user: { id: 'u1' } } as Order;

    const foundOrder = { id: 'order123', user: mockUser } as Order;
    orderRepository.findOne.mockResolvedValue(foundOrder);

    const result = await service.getOrderOwner(orderInput);

    expect(result).toEqual(mockUser);
    expect(orderRepository.findOne).toHaveBeenCalledWith({
      where: { id: orderInput.user.id },
      relations: ['user'],
    });
  });

  it('should throw NotFoundException if order not found', async () => {
    const orderInput = { id: 'order123', user: { id: 'u1' } } as Order;
    orderRepository.findOne.mockResolvedValue(null);

    await expect(service.getOrderOwner(orderInput)).rejects.toThrow(
      NotFoundException,
    );
  });
});
