import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  Put,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HaravanService } from '../haravan/haravan.service';
import { RequestPayload } from '../shared/types/controller.type';
import { EUserRole } from './enums/user-role.enum';
import { UserQueryDto } from './dto/user-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserUpdateCrmInfoDto } from './dto/user-update-profile.dto';
import { UserInfoDto } from './dto/user-info';
import { ReturnUserPriorityDto } from './dto/get-user-priority.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly haravanService: HaravanService,
  ) {}

  // @UseGuards(JwtAuthGuard)
  // @Roles(EUserRole.admin)
  // @Get('sync-crm')
  // @ApiOperation({
  //   description: 'Sync CRM Users',
  // })
  // async syncCrm() {
  //   return this.userService.syncCrmUsers();
  // }

  @UseGuards(JwtAuthGuard)
  @Roles(EUserRole.admin)
  @Get()
  @ApiOperation({
    description: 'List toàn bộ user trên hệ thống',
  })
  async getAllUser(@Query() query: UserQueryDto) {
    return this.userService.findAllUser(query);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    description: 'Get thông tin user',
  })
  async getUser(@Request() req: RequestPayload, @Param('id') id: string) {
    if (req.user.role != EUserRole.admin) {
      id = req.user.id;
    }

    return this.userService.findUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('crm/request-update-info')
  @ApiOperation({
    description: 'Update thông tin CRM của user',
  })
  async updateUserCrmInfo(
    @Request() req: RequestPayload,
    @Body() body: UserUpdateCrmInfoDto,
  ) {
    return this.userService.sendUpdateInfoRequestToCrm(req.user.crmId, body);
  }

  // @UseGuards(JwtAuthGuard)
  // @Put('crm/update-tol-ref')
  // @ApiOperation({
  //   description: 'Update thông tin ref CRM của user',
  // })
  // async updateCrmRef() {
  //   return this.userService.updateCrmRefPoint(
  //     '661d4333f803a4002b440c53',
  //     449122050,
  //   );
  // }

  // @UseGuards(JwtAuthGuard)
  // @Roles(EUserRole.admin)
  // @Post()
  // @ApiOperation({
  //   description: 'Tạo user',
  // })
  // async createUser(@Request() req: RequestPayload, @Body() body: UserInfoDto) {
  //   return this.userService.createUser(body);
  // }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    description: 'Update thông tin của user',
  })
  async updateUser(
    @Request() req: RequestPayload,
    @Param('id') userId: string,
    @Body() body: UserInfoDto,
  ) {
    if (req.user.role != EUserRole.admin) {
      userId = req.user.id;
    }

    return this.userService.updateUser(userId, body);
  }

  @Get('priority/get-all')
  @ApiOperation({
    description: 'Get priority of all users',
  })
  async getAllUserPriority(): Promise<ReturnUserPriorityDto[]> {
    return this.userService.getAllUserPriority();
  }

  @Get('priority/:haravanId')
  @ApiOperation({
    description: 'Get user priority by haravanId',
  })
  async getUserPriorityById(
    @Param('haravanId') haravanId: string,
  ): Promise<ReturnUserPriorityDto> {
    return this.userService.getUserPriorityById(haravanId);
  }

  // @UseGuards(JwtAuthGuard)
  // @Delete()
  // async deleteById(@Request() req: RequestPayload): Promise<void> {
  //   await this.userService.deleteById(req.user.id);
  // }

  //@UseGuards(JwtAuthGuard)
}
