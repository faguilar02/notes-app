import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

import { User } from '../users/entities/user.entity';
import { Auth } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @Auth()
  testPrivateRoute(@GetUser() user: User) {
    return {
      ok: true,
      message: 'This is a private route',
      user,
    };
  }
}
