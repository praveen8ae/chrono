export type UserRole = 'admin' | 'employee';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
};
