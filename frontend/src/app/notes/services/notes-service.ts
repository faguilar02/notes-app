import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  Info,
  Note,
  NotesResponse,
  Status,
} from '../interfaces/get-all-notes.interface';
import { environment } from '../../../environments/environment';
import { NewCategoryFromAPI } from '../interfaces/newCategoryFromApi.interface';
import { NewNote } from '../interfaces/newCategory.interface';

interface FilterParams {
  status: Status;
  category: string;
}

const baseUrl = environment.baseUrl;
@Injectable({ providedIn: 'root' })
export class NotesService {
  private http = inject(HttpClient);
  public summary = signal<Info | undefined>(undefined);
  public notes = signal<Note[]>([]);
  getAllNotes(params: FilterParams): Observable<NotesResponse> {
    console.log('Filter params:', params);
    return this.http.get<NotesResponse>(`${baseUrl}/notes`).pipe(
      tap((response) => this.summary.set(response.info)),
      tap((response) => this.notes.set(response.notes)),
      tap((response) => console.log('Raw response:', response)),
      map((response) => {
        let filteredNotes = response.notes;

        // Filter by status
        if (params.status) {
          filteredNotes = filteredNotes.filter(
            (note) => note.status === params.status
          );
        }

        // Filter by category
        if (params.category) {
          filteredNotes = filteredNotes.filter((note) =>
            note.categories.some((cat) => cat.name === params.category)
          );
        }

        console.log('Filtered notes:', filteredNotes);
        return {
          ...response,
          notes: filteredNotes,
        };
      })
    );
  }

  createNote(note: NewNote): Observable<NewCategoryFromAPI> {
    return this.http
      .post<NewCategoryFromAPI>(`${baseUrl}/notes`, note)
      .pipe(tap((response) => console.log(response)));
  }

  archiveNotes(id: string) {
    return this.http.patch(`${baseUrl}/notes/${id}/archive`, {});
  }

  unarchiveNotes(id: string) {
    return this.http.patch(`${baseUrl}/notes/${id}/unarchive`, {});
  }

  editNote(note: NewNote): Observable<any> {
    const { id, ...noteData } = note;
    return this.http.patch(`${baseUrl}/notes/${id}`, noteData);
  }

  removeNote(id: string) {
    return this.http.delete(`${baseUrl}/notes/${id}`);
  }
}
