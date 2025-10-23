import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Category } from '../../interfaces/category.interface';
import { NgClass } from '@angular/common';
import { NewNote } from '../../interfaces/newCategory.interface';
import { Note } from '../../interfaces/get-all-notes.interface';

interface CategoryInfo {
  name: string;
  isSelectionated: boolean;
}
@Component({
  selector: 'app-create-note-modal',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './create-note-modal.html',
})
export class CreateNoteModal {
  fb = inject(FormBuilder);
  isModalOpen = output<boolean>();
  categories = input<Category[]>([]);
  noteToEdit = input<Note | null>(null);
  newNote = output<NewNote>();
  updateNote = output<NewNote>();

  isEditMode = computed(() => this.noteToEdit() !== null);

  newNoteForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    customCategory: [''],
  });

  availableCategories = linkedSignal<CategoryInfo[]>(() => {
    return this.categories().map((category) => {
      const { name } = category;
      const noteToEdit = this.noteToEdit();
      const isSelectionated = noteToEdit
        ? noteToEdit.categories.some((cat) => cat.name === name)
        : false;
      return { name, isSelectionated };
    });
  });

  constructor() {
    effect(() => {
      const note = this.noteToEdit();
      if (note) {
        this.newNoteForm.patchValue({
          title: note.title,
          description: note.description || '',
        });
      } else {
        this.newNoteForm.reset();
      }
    });
  }

  selectionatedCategories = computed(() =>
    this.availableCategories()
      .filter((category) => category.isSelectionated)
      .map((category) => category.name)
  );

  closeModal() {
    this.isModalOpen.emit(false);
  }

  changeIsSelectionatedValue(name: string) {
    this.availableCategories.update((categories) =>
      categories.map((category) =>
        category.name === name
          ? { ...category, isSelectionated: !category.isSelectionated }
          : category
      )
    );
  }

  addCategoryToList() {
    const newCategory: string = this.newNoteForm
      .get('customCategory')
      ?.value.trim();

    if (!newCategory) return;

    const newCategoryFormated =
      newCategory.charAt(0).toUpperCase() + newCategory.slice(1).toLowerCase();

    const newCategoryInfo: CategoryInfo = {
      name: newCategoryFormated,
      isSelectionated: true,
    };
    if (this.availableCategories().some((c) => c.name === newCategoryFormated))
      return;

    this.availableCategories.update((categories) => [
      ...categories,
      newCategoryInfo,
    ]);
  }

  createNote() {
    if (this.newNoteForm.invalid) {
      this.newNoteForm.markAllAsTouched();
      return;
    }

    const title = this.newNoteForm.get('title')?.value?.trim();
    if (!title) return;

    const descriptionValue = this.newNoteForm.get('description')?.value;
    const description = descriptionValue ? descriptionValue.trim() : '';

    const categories = this.selectionatedCategories();

    const note: any = {
      title: title,
      categories: categories,
    };

    if (description && description.length > 0) {
      note.description = description;
    }

    if (this.isEditMode()) {
      note.id = this.noteToEdit()!.id;
      this.updateNote.emit(note);
    } else {
      this.newNote.emit(note);
    }

    console.log(note);
  }
}
