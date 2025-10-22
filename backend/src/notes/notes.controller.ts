import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto, FilterNotesDto } from './dto';
import { User } from '../users/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('notes')
@Auth()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Body() createNoteDto: CreateNoteDto, @GetUser() user: User) {
    return this.notesService.create(createNoteDto, user);
  }

  @Get()
  findAll(@Query() filterDto: FilterNotesDto, @GetUser() user: User) {
    return this.notesService.findAll(filterDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.notesService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @GetUser() user: User,
  ) {
    return this.notesService.update(id, updateNoteDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @GetUser() user: User) {
    await this.notesService.remove(id, user);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string, @GetUser() user: User) {
    return this.notesService.archive(id, user);
  }

  @Patch(':id/unarchive')
  unarchive(@Param('id') id: string, @GetUser() user: User) {
    return this.notesService.unarchive(id, user);
  }
}
