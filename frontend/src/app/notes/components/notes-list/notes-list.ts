import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Note } from '../../interfaces/get-all-notes.interface';
import { NotesService } from '../../services/notes-service';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './notes-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesListComponent {
  hasNotes = input<boolean>(false);
  notes = input<Note[]>([]);
  totalNotes = input<number>(0); // total notes (active + archived)
  currentStatus = input<string>('active'); // current filter status
  createNote = output<boolean>();
  editNote = output<Note>();
  noteArchived = output<boolean>(); // true = archived, false = unarchived
  noteDeleted = output<boolean>(); // emits when note is deleted
  notesService = inject(NotesService);
  changeRefreshTickValue = output<boolean>();

  private categoryColors = [
    'bg-pink-500',
    'bg-orange-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-cyan-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  private colorCache = new Map<string, string>();

  onCreateNote() {
    this.createNote.emit(true);
  }

  getCategoryColor(categoryName: string): string {
    if (this.colorCache.has(categoryName)) {
      return this.colorCache.get(categoryName)!;
    }

    const randomIndex = Math.floor(Math.random() * this.categoryColors.length);
    const color = this.categoryColors[randomIndex];

    this.colorCache.set(categoryName, color);

    return color;
  }

  archiveNotes(note: Note) {
    if (note.status === 'archived') {
      this.notesService.unarchiveNotes(note.id).subscribe({
        next: () => {
          console.log('desarchivado correctamente');
          this.noteArchived.emit(false); // false = unarchived
          this.changeRefreshTickValue.emit(true);
        },
        error: (err) => {
          console.error('Error unarchiving note:', err);
        },
      });
    } else {
      this.notesService.archiveNotes(note.id).subscribe({
        next: () => {
          console.log('archivado correctamente');
          this.noteArchived.emit(true); // true = archived
          this.changeRefreshTickValue.emit(true);
        },
        error: (err) => {
          console.error('Error archiving note:', err);
        },
      });
    }
  }

  logNote(note: Note) {}

  onEditNote(note: Note) {
    this.editNote.emit(note);
  }

  onDeleteNote(id: string) {
    this.notesService.removeNote(id).subscribe({
      next: () => {
        this.noteDeleted.emit(true);
        this.changeRefreshTickValue.emit(true);
      },
      error: (err) => {
        console.error('Error deleating note:', err);
      },
    });
  }
}
