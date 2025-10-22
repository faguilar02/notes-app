import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findOrCreateCategories(
    categoryNames: string[],
    user: User,
  ): Promise<Category[]> {
    const categories: Category[] = [];

    for (const name of categoryNames) {
      const capitalizedName = this.capitalizeName(name);

      let category = await this.categoriesRepository.findOne({
        where: [
          { name: capitalizedName, user: IsNull() },
          { name: capitalizedName, user: { id: user.id } },
        ],
      });

      if (!category) {
        category = this.categoriesRepository.create({
          name: capitalizedName,
          user,
        });
        await this.categoriesRepository.save(category);
      }

      categories.push(category);
    }

    return categories;
  }

  private capitalizeName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  async findAllByUser(user: User): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: [{ user: IsNull() }, { user: { id: user.id } }],
      order: { name: 'ASC' },
    });
  }
}
