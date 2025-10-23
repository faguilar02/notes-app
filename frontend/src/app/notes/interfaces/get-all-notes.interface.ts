import { User } from '../../auth/interfaces/user.interface';
import { Category } from './category.interface';

export interface NotesResponse {
  info: Info;
  notes: Note[];
}

export interface Info {
  total: number;
  active: number;
  archived: number;
}

export interface Note {
  id: string;
  title: string;
  description: string;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  categories: Category[];
  user: User;
}

export enum Status {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}
