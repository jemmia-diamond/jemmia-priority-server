import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Pagination } from 'nestjs-typeorm-paginate';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Notification } from './entities/notification.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UserService } from '../user/user.service';
import { PaginFindNotificationDto } from './dto/pagin-find-notification.dto';

@ApiTags('Notification')
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Tìm kiếm tất cả notification theo phân trang và type.',
  })
  async findAllByUserId(
    @Request() req,
    @Query() query: PaginFindNotificationDto,
  ): Promise<Pagination<Notification>> {
    query.size = Math.min(50, query.size); // Giới hạn limit tối đa là 50
    console.log(query.type);
    return this.notificationService.findAllByUserId(
      req.user.id,
      query.page,
      query.size,
      query.type,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({
    description: 'Tìm kiếm notification theo notificationId và userDecodeId.',
  })
  async findById(@Request() req, @Param('id') notifiId: string = '') {
    return this.notificationService.findDetail(req.user.id, notifiId);
  }

  // @Post()
  // @UseGuards(JwtAuthGuard)
  // @ApiOperation({
  //   description: 'Tạo notification',
  // })
  // async createNotification(
  //   @Request() req,
  //   @Body() body: CreateNotificationDto,
  // ) {
  //   const userDecodeFound = await this.userService.findUserNative(req.user.id);
  //   return this.notificationService.create(userDecodeFound, body);
  // }
}
