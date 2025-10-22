import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';

const SEED_USER = {
  username: 'ensolvers',
  password: 'ensolvers',
};

const PREDEFINED_CATEGORIES = ['Personal', 'Work', 'Ideas', 'Tasks', 'Study'];

@Injectable()
export class SeedService {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async runSeed(): Promise<string> {
    await this.seedCategories();
    await this.seedUser();

    return 'Admin user and categories created successfully';
  }

  private async seedUser(): Promise<void> {
    await this.deleteExistingUser();
    await this.usersService.create(SEED_USER);
  }

  private async seedCategories(): Promise<void> {
    await this.deletePredefinedCategories();
    await this.createPredefinedCategories();
  }

  private async deleteExistingUser(): Promise<void> {
    const existingUser = await this.usersService.findByUsername(
      SEED_USER.username,
    );

    if (existingUser) {
      await this.userRepository.remove(existingUser);
    }
  }

  private async deletePredefinedCategories(): Promise<void> {
    const predefinedCategories = await this.categoryRepository.find({
      where: { user: IsNull() },
    });

    if (predefinedCategories.length > 0) {
      await this.categoryRepository.remove(predefinedCategories);
    }
  }

  private async createPredefinedCategories(): Promise<void> {
    const categories = PREDEFINED_CATEGORIES.map((name) =>
      this.categoryRepository.create({ name, user: null }),
    );

    await this.categoryRepository.save(categories);
  }
}
