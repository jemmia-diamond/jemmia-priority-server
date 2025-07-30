import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh.strategy';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtStrategy } from './strategy/jwt.strategy';
import { EUserRole } from '../user/enums/user-role.enum';
import { VerifyOtpDto } from '../zalo-otp/dto/send-otp.dto';
import { BearerAuthGuard } from './guards/bearer-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/oauth')
  @ApiOperation({
    description:
      'Admin & Client Login qua Google Firebase, vào link ENDPOINT/index.html để login với Google và lấy token',
  })
  oauth(@Body() body: AuthDto) {
    return this.authService.oauth(body);
  }

  @UseGuards(JwtRefreshTokenStrategy)
  @Post('/refresh-token')
  refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }

  @UseGuards(JwtStrategy)
  @Get('is-admin')
  isAdmin(@Request() req) {
    if (req.user.role == EUserRole.admin) {
      return 'OK';
    }

    throw new HttpException('NOT_ADMIN', HttpStatus.UNAUTHORIZED);
  }
  @UseGuards(BearerAuthGuard)
  @Post('/zaloauth')
  zaloAuth(@Body() body: VerifyOtpDto) {
    return this.authService.zaloAuth(body.phone, body.otp);
  }
}
