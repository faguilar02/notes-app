import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { Note } from './entities/note.entity';
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Note]), AuthModule, CategoriesModule],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [TypeOrmModule],
})
export class NotesModule {}
