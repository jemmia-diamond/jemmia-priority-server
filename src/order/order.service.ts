import { Injectable } from '@nestjs/common';
import { HaravanOrderSearchDto } from '../haravan/dto/haravan-order.dto';
import { HaravanService } from '../haravan/haravan.service';
import { EUserRole } from '../user/enums/user-role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly haravanService: HaravanService,
  ) {}

  async findAll(query: HaravanOrderSearchDto, role: string, userId: string) {
    try {
      if (role != EUserRole.admin) {
        const user = await this.userRepository.findOneBy({ id: userId });
        query.customer.id = user.haravanId;
      }
      return {
        orders: await this.haravanService.findAllOrder(query),
      };
    } catch (error) {
      return error;
    }
  }

  async findOne(id: number, role: string, userId: string) {
    try {
      const query = new HaravanOrderSearchDto();
      if (role != EUserRole.admin) {
        const user = await this.userRepository.findOneBy({ id: userId });
        query.customer.id = user.haravanId;
      }
      return await this.haravanService.findOneOrder(query, id);
    } catch (error) {
      return error;
    }
  }
}
