import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAllByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<Pagination<Notification>> {
    try {
      const offset = (page - 1) * limit;

      const user = await this.userRepository.findOneBy({
        id: userId,
      });

      const [items, totalItems] =
        await this.notificationRepository.findAndCount({
          where: { receiver: user },
          order: { createdDate: 'DESC' },
          skip: offset,
          take: limit,
        });

      const totalPages = Math.ceil(totalItems / limit);

      const meta = {
        itemCount: totalItems,
        itemsPerPage: limit,
        totalPages,
        totalItems,
        currentPage: page,
      };

      return new Pagination<Notification>(items, meta);
    } catch (error) {
      return error;
    }
  }
}
