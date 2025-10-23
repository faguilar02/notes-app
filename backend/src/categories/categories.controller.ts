import { Controller, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { User } from '../users/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('categories')
@Auth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@GetUser() user: User) {
    return this.categoriesService.findAllByUser(user);
  }
}
