import type { Role } from '@/lib/roles';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: Role;
  bio?: string;
  rollNo?: string;
  branch?: string;
  yearOfStudy?: string;
  linkedin?: string;
  emailNotifications: boolean;
  disabled: boolean;
  createdAt: string;
  updatedAt?: string;
}
