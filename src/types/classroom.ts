export type AppRole = 'teacher' | 'student';
export type ClassRole = 'teacher' | 'student';
export type ParentType = 'post' | 'assignment' | 'submission' | 'class';
export type SubmissionStatus = 'assigned' | 'turned_in' | 'returned' | 'graded';

// Department options for login
export const DEPARTMENTS = [
  'IT',
  'CSE',
  'ECE',
  'EEE',
  'MECH',
  'CIVIL',
  'AUTO',
  'AIDS',
  'AIML',
  'BME',
] as const;

export type Department = typeof DEPARTMENTS[number];

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole | null;
  department?: Department | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Class {
  id: string;
  title: string;
  section: string | null;
  subject: string | null;
  room: string | null;
  description: string | null;
  banner_color: string;
  class_code: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface ClassMembership {
  id: string;
  user_id: string;
  class_id: string;
  role: ClassRole;
  invited_by: string | null;
  created_at: string;
  user?: Profile;
}

export interface Post {
  id: string;
  class_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
  attachments?: Attachment[];
  comments?: Comment[];
}

export interface Assignment {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  due_date: string | null;
  points: number;
  topic: string | null;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
  submission?: Submission;
}

export interface Material {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  topic: string | null;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string | null;
  status: SubmissionStatus;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  student?: Profile;
  grade?: Grade;
  attachments?: Attachment[];
}

export interface Grade {
  id: string;
  submission_id: string;
  grade: number | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  parent_type: ParentType;
  parent_id: string;
  author_id: string;
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Attachment {
  id: string;
  parent_type: ParentType;
  parent_id: string;
  name: string;
  url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

// Banner color options like Google Classroom
export const BANNER_COLORS = [
  '#1967d2', // Blue (default)
  '#137333', // Green
  '#a142f4', // Purple
  '#e52592', // Pink
  '#00796b', // Teal
  '#c26401', // Orange
  '#5f6368', // Gray
  '#d32f2f', // Red
] as const;

// Class topics for organization
export const DEFAULT_TOPICS = [
  'No topic',
  'Week 1',
  'Week 2',
  'Week 3',
  'Unit 1',
  'Unit 2',
  'Homework',
  'Classwork',
  'Exams',
] as const;
