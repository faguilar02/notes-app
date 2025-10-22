import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SeedService {
  constructor(private readonly usersService: UsersService) {}

  async runSeed(): Promise<string> {
    const username = 'ensolvers';
    const password = 'ensolvers';
    const existingUser = await this.usersService.findByUsername(username);

    if (existingUser) {
      return 'Admin user already exists';
    }

    await this.usersService.create({
      username,
      password,
    });

    return 'Admin user created successfully';
  }
}
