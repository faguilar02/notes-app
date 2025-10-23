export interface NewCategoryFromAPI {
  title:       string;
  description: string;
  status:      string;
  user:        User;
  categories:  Category[];
  id:          string;
  createdAt:   Date;
  updatedAt:   Date;
}

export interface Category {
  id:        string;
  name:      string;
  createdAt: Date;
  updatedAt: Date;
  user?:     User;
}

export interface User {
  id:        string;
  username:  string;
  createdAt: Date;
  updatedAt: Date;
}
