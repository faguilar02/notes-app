import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const { username, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { username },
      select: { id: true, username: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const { password: _, ...userData } = user;

    return {
      user: { ...userData },
      token: this.getJwtToken({ id: user.id, username: user.username }),
    };
  }

  async checkAuthStatus(user: User) {
    const { password, ...userData } = user;

    return {
      user: { ...userData },
      token: this.getJwtToken({ id: user.id, username: user.username }),
    };
  }

  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private getJwtToken(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
