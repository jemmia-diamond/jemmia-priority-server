import {
  Controller,
  Get,
  Body,
  Param,
  UseGuards,
  Put,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor,
  Delete,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserUpdateProfileDto } from './dto/user-update-profile.dto';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  @Get('profile/:id')
  @ApiOperation({
    description: 'Get profile của user khác',
  })
  async getProfile(@Param('id') id: string) {
    return this.userService.getProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({
    description:
      'Get profile của chính mình, API này sẽ trả các thông tin ẩn của user',
  })
  async getOwnProfile(@Request() req) {
    return this.userService.getProfileMine(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiOperation({
    description: 'Update thông tin của user',
  })
  async updateProfile(@Request() req, @Body() body: UserUpdateProfileDto) {
    return this.userService.updateProfile(body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteById(@Request() req): Promise<void> {
    await this.userService.deleteById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/referral')
  async getReferral(
    @Request() req
  ) {
    return this.userService.getReferral(req.user.id);
  }
}
