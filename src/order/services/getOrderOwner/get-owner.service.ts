import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { User } from '../../../user/entities/user.entity';

// This service retrieves the owner of an order
// It uses the Order entity to find the user associated with the order
@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getOrderOwner(order: Order): Promise<User> {
    const foundOrder = await this.orderRepository.findOne({
      where: { id: order.user.id },
      relations: ['user'],
    });

    if (!foundOrder) {
      throw new NotFoundException(`Order ${order.id} not found`);
    }

    return foundOrder.user;
  }
}
