export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  role: Role;
  token?: string; // To store JWT temporarily
}

export interface Course {
  id: string;
  title: string;
  description: string;
  credits: number;
  imageFilename?: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  //courseId: string | null;
  courseIds?: string[]; 
}