import { IUser } from './iuser';

export type TaskStatus = 'todo' | 'progress' | 'await' | 'done';
export type TaskPriority = 'low' | 'medium' | 'urgent';
export type TaskCategory = 'User Story' | 'Technical Task';

export interface Task {
  id: number;
  created_at: string | null;
  title: string | null;
  description: string | null;
  date: string | null;
  worker_id: number[] | null;
  subtask: string | null;
  category: TaskCategory | null;
  priority: TaskPriority | null;
  status: TaskStatus | null;
}

// Nur für die Anzeige: Kontakte werden im Service ergänzt.
export interface TaskWithContacts extends Task {
  assignedContacts: IUser[];
}

// Diese Daten werden beim Erstellen an Supabase geschickt.
export type TaskCreate = Omit<Task, 'id' | 'created_at'>;

// Beim Ändern dürfen einzelne Felder übergeben werden.
export type TaskUpdate = Partial<TaskCreate>;