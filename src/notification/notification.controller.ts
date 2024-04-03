import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Notification } from './entities/notification.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/user')
  async findAllByUserId(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<Pagination<Notification>> {
    limit = Math.min(50, limit); // Giới hạn limit tối đa là 50
    return this.notificationService.findAllByUserId(req.user.id, page, limit);
  }
}
