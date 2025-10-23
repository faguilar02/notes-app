import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { NotesService } from '../../services/notes-service';
import { Info } from '../../interfaces/get-all-notes.interface';

@Component({
  selector: 'app-notes-summary',
  imports: [],
  templateUrl: './notes-summary.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesSummary {
  private notesService = inject(NotesService);
  summary = computed(() => this.notesService.summary());
}
