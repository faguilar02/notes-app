import { IsOptional, IsEnum, IsString } from 'class-validator';
import { NoteStatus } from '../enums/note-status.enum';

export class FilterNotesDto {
  @IsOptional()
  @IsEnum(NoteStatus)
  status?: NoteStatus;

  @IsOptional()
  @IsString()
  category?: string;
}
