import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Note } from './entities/note.entity';
import { User } from '../users/entities/user.entity';
import { CreateNoteDto, UpdateNoteDto, FilterNotesDto } from './dto';
import { CategoriesService } from '../categories/categories.service';
import { NoteStatus } from './enums/note-status.enum';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private notesRepository: Repository<Note>,
    private categoriesService: CategoriesService,
  ) {}

  async create(createNoteDto: CreateNoteDto, user: User): Promise<Note> {
    const { title, description, categories: categoryNames } = createNoteDto;

    const categories = categoryNames
      ? await this.categoriesService.findOrCreateCategories(categoryNames, user)
      : [];

    const note = this.notesRepository.create({
      title,
      description,
      user,
      categories,
      status: NoteStatus.ACTIVE,
    });

    const savedNote = await this.notesRepository.save(note);

    return this.excludeUserPassword(savedNote);
  }

  async findAll(filterDto: FilterNotesDto, user: User) {
    const queryBuilder = this.buildNotesQuery(user);
    this.applyFilters(queryBuilder, filterDto);

    const notes = await queryBuilder
      .orderBy('note.createdAt', 'DESC')
      .getMany();

    // Count total, active and archived notes
    const totalCount = await this.notesRepository.count({
      where: { user: { id: user.id } },
    });

    const activeCount = await this.notesRepository.count({
      where: { user: { id: user.id }, status: NoteStatus.ACTIVE },
    });

    const archivedCount = await this.notesRepository.count({
      where: { user: { id: user.id }, status: NoteStatus.ARCHIVED },
    });

    return {
      info: {
        total: totalCount,
        active: activeCount,
        archived: archivedCount,
      },
      notes: notes.map((note) => this.excludeUserPassword(note)),
    };
  }

  async findOne(id: string, user: User): Promise<Note> {
    const note = await this.findNoteByIdAndUser(id, user);
    return this.excludeUserPassword(note);
  }

  async update(
    id: string,
    updateNoteDto: UpdateNoteDto,
    user: User,
  ): Promise<Note> {
    const note = await this.findNoteByIdAndUser(id, user);

    this.updateNoteFields(note, updateNoteDto);

    if (updateNoteDto.categories !== undefined) {
      note.categories = await this.categoriesService.findOrCreateCategories(
        updateNoteDto.categories,
        user,
      );
    }

    const savedNote = await this.notesRepository.save(note);

    return this.excludeUserPassword(savedNote);
  }

  async remove(id: string, user: User): Promise<void> {
    // Ensure note exists and belongs to the user
    const note = await this.findNoteByIdAndUser(id, user);
    // Remove the note entity
    await this.notesRepository.remove(note);
  }

  async archive(id: string, user: User): Promise<Note> {
    return this.changeNoteStatus(id, user, NoteStatus.ARCHIVED);
  }

  async unarchive(id: string, user: User): Promise<Note> {
    return this.changeNoteStatus(id, user, NoteStatus.ACTIVE);
  }

  private async findNoteByIdAndUser(id: string, user?: User): Promise<Note> {
    const note = await this.notesRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['categories', 'user'],
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  private async changeNoteStatus(
    id: string,
    user: User,
    status: NoteStatus,
  ): Promise<Note> {
    const note = await this.findNoteByIdAndUser(id, user);
    note.status = status;
    const savedNote = await this.notesRepository.save(note);

    return this.excludeUserPassword(savedNote);
  }

  private buildNotesQuery(user: User): SelectQueryBuilder<Note> {
    return this.notesRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.categories', 'category')
      .leftJoinAndSelect('note.user', 'user')
      .where('note.userId = :userId', { userId: user.id });
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Note>,
    filterDto: FilterNotesDto,
  ): void {
    const { status, category } = filterDto;

    if (status) {
      queryBuilder.andWhere('note.status = :status', { status });
    }

    if (category) {
      this.applyCategoryFilter(queryBuilder, category);
    }
  }

  private applyCategoryFilter(
    queryBuilder: SelectQueryBuilder<Note>,
    category: string,
  ): void {
    const capitalizedCategory = this.capitalizeCategory(category);

    queryBuilder.andWhere((qb) => {
      const subQuery = qb
        .subQuery()
        .select('nc.note_id')
        .from('note_categories', 'nc')
        .innerJoin('categories', 'c', 'nc.category_id = c.id')
        .where('c.name = :categoryName')
        .getQuery();
      return `note.id IN ${subQuery}`;
    });

    queryBuilder.setParameter('categoryName', capitalizedCategory);
  }

  private updateNoteFields(note: Note, updateDto: UpdateNoteDto): void {
    if (updateDto.title !== undefined) {
      note.title = updateDto.title;
    }

    if (updateDto.description !== undefined) {
      note.description = updateDto.description;
    }
  }

  private excludeUserPassword(note: Note): Note {
    if (note.user) {
      const { password, ...userWithoutPassword } = note.user;
      note.user = userWithoutPassword as User;
    }
    return note;
  }

  private capitalizeCategory(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  }
}
