import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Header } from '../../components/header/header';
import { NotesToolbarComponent } from '../../components/toolbar/toolbar';
import { NotesSummary } from '../../components/notes-summary/notes-summary';
import { NotesListComponent } from '../../components/notes-list/notes-list';
import { CreateNoteModal } from '../../components/create-note-modal/create-note-modal';
import { rxResource } from '@angular/core/rxjs-interop';
import { CategoriesService } from '../../services/categories-service';
import { NotesService } from '../../services/notes-service';
import { NewNote } from '../../interfaces/newCategory.interface';
import { Note, Status } from '../../interfaces/get-all-notes.interface';
import { ToastComponent } from '../../../shared/components/toast/toast';

interface FilterParams {
  status: Status;
  category: string;
}

const defaultParams: FilterParams = {
  status: Status.ACTIVE,
  category: '',
};

@Component({
  selector: 'app-home-page',
  imports: [
    Header,
    NotesToolbarComponent,
    NotesSummary,
    NotesListComponent,
    CreateNoteModal,
    ToastComponent,
  ],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  hasNotes = signal(false);

  refreshTick = signal<number>(0);
  // Cambia esto a true para ver el modal
  showModal = signal(false);
  noteToEdit = signal<Note | null>(null);

  // Toast signals
  showToast = signal(false);
  toastTitle = signal('');
  toastMessage = signal('');
  toastType = signal<'success' | 'error' | 'info'>('success');

  newNote = signal<NewNote | null>(null);
  params = signal<FilterParams>(defaultParams);
  categoriesService = inject(CategoriesService);
  notesService = inject(NotesService);

  categoriesResource = rxResource({
    request: () => ({
      refresh: this.refreshTick(),
    }),
    loader: ({ request }) => {
      return this.categoriesService.getCategories();
    },
  });

  notesResource = rxResource({
    request: () => ({
      refresh: this.refreshTick(),
      params: this.params(),
    }),
    loader: ({ request }) => {
      return this.notesService.getAllNotes(request.params);
    },
  });

  createNote(note: NewNote) {
    return this.notesService.createNote(note).subscribe({
      next: (createdNote) => {
        this.refreshTick.update((v) => v + 1);
        this.showModal.set(false);
        this.noteToEdit.set(null);
        this.displayToast('Success!', 'Note created successfully', 'success');
      },
      error: (err) => {
        console.error('Error creating note:', err);
        this.displayToast('Error', 'Failed to create note', 'error');
      },
    });
  }

  editNote(note: NewNote) {
    return this.notesService.editNote(note).subscribe({
      next: () => {
        this.refreshTick.update((v) => v + 1);
        this.showModal.set(false);
        this.noteToEdit.set(null);
        this.displayToast('Success!', 'Changes saved successfully', 'success');
      },
      error: (err) => {
        console.error('Error editing note:', err);
        this.displayToast('Error', 'Failed to save changes', 'error');
      },
    });
  }

  openEditModal(note: Note) {
    this.noteToEdit.set(note);
    this.showModal.set(true);
  }

  closeModalAndReset() {
    this.showModal.set(false);
    this.noteToEdit.set(null);
  }

  displayToast(
    title: string,
    message: string,
    type: 'success' | 'error' | 'info'
  ) {
    this.toastTitle.set(title);
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  onNoteArchived(isArchived: boolean) {
    if (isArchived) {
      this.displayToast('Success!', 'Note archived successfully', 'success');
    } else {
      this.displayToast('Success!', 'Note unarchived successfully', 'success');
    }
  }

  onNoteDeleted() {
    this.displayToast('Success!', 'Note deleted successfully', 'success');
  }

  addOneToRefreshTick(value: boolean) {
    if (value) {
      this.refreshTick.update((v) => v + 1);

      return;
    }
  }

  setQueryParams(params: FilterParams) {
    console.log(params);
    this.params.set(params);
  }
}
