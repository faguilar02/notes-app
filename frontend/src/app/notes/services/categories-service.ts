import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Category } from '../interfaces/category.interface';
const baseUrl = environment.baseUrl;
@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${baseUrl}/categories`);
  }


}
