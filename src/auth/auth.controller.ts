import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh.strategy';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/oauth')
  @ApiOperation({
    description:
      'Login qua Google, Facebook và cả Email & Password Firebase, vào link ENDPOINT/index.html để login với Google và lấy token',
  })
  oauth(@Body() body: AuthDto) {
    return this.authService.oauth(body);
  }

  @UseGuards(JwtRefreshTokenStrategy)
  @Post('/refresh-token')
  refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user);
  }
}
