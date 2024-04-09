import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType } from './enums/noti-type.enum';

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
    type: string,
  ): Promise<Pagination<Notification>> {
    try {
      const offset = (page - 1) * limit;

      const user = await this.userRepository.findOneBy({
        id: userId,
      });

      if (type == '') {
        const [items, totalItems] =
          await this.notificationRepository.findAndCount({
            where: { receiver: user },
            order: { createdDate: 'DESC' },
            skip: offset,
            take: limit,
            relations: ['receiver'],
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
      } else {
        const [items, totalItems] =
          await this.notificationRepository.findAndCount({
            where: { receiver: user, type: NotificationType[type] },
            order: { createdDate: 'DESC' },
            skip: offset,
            take: limit,
            relations: ['receiver'],
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
      }
    } catch (error) {
      return error;
    }
  }

  async findDetail(userId, notifiId) {
    const notificationFound = await this.notificationRepository.findOne({
      where: {
        id: notifiId,
        receiver: {
          id: userId,
        },
      },
      relations: ['receiver'],
    });
    if (notificationFound) {
      notificationFound.isSeen = true;
      await this.notificationRepository.save(notificationFound);
      return notificationFound;
    }
    return `Not Found Notification with userDecodeId: ${userId} with notificationId: ${notifiId}`;
  }

  async create(user: User, notifiDto: CreateNotificationDto) {
    return await this.notificationRepository.save({
      title: notifiDto.title,
      description: notifiDto.description || '',
      type: notifiDto.type,
      receiver: user,
    });
  }
}
