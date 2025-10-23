import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CategoriesService } from '../../services/categories-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Category } from '../../interfaces/category.interface';
import { Status } from '../../interfaces/get-all-notes.interface';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterParams {
  status: Status;
  category: string;
}

@Component({
  selector: 'notes-toolbar',
  imports: [],
  templateUrl: './toolbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesToolbarComponent {
  categoriesService = inject(CategoriesService);
  showArchived = signal(false);
  showDropdown = signal(false);
  selectedFilter = signal('All');
  isModalOpen = output<boolean>();
  refreshTick = signal<number>(0);
  categories = input<Category[]>([]);
  status = signal<Status>(Status.ACTIVE);
  queryParams = output<FilterParams>();

  statusOptions = Status;

  toggleArchived() {
    this.showArchived.update((value) => !value);
  }

  toggleDropdown() {
    this.showDropdown.update((value) => !value);
  }

  selectFilter(label: string, value: string) {
    this.selectedFilter.set(label);
    this.showDropdown.set(false);
    this.sendParamsStatusOrCategory();
  }

  emitIsModalOpen() {
    this.isModalOpen.emit(true);
  }

  toggleNotesStatus(status: Status) {
    this.status.set(status);
    this.sendParamsStatusOrCategory();
  }

  sendParamsStatusOrCategory() {
    let category: string;
    if (this.selectedFilter() !== 'All') {
      category = this.selectedFilter();
    } else {
      category = '';
    }

    let params: FilterParams = {
      status: this.status(),
      category,
    };

    this.queryParams.emit(params);
  }
}
