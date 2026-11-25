import { IUser } from './iuser';

/** The four columns of the Kanban board. */
export type TaskStatus = 'todo' | 'progress' | 'await' | 'done';

/** Possible priorities of a task. */
export type TaskPriority = 'low' | 'medium' | 'urgent';

/** Possible categories of a task. */
export type TaskCategory = 'User Story' | 'Technical Task';

/**
 * A task from the "task" table.
 */
export interface Task {
  id: number;
  created_at: string | null;
  title: string | null;
  description: string | null;
  date: string | null;
  worker_id: number[] | null;
  subtask: Subtask[] | null;
  category: TaskCategory | null;
  priority: TaskPriority | null;
  status: TaskStatus;
  position: number | null;
}

/**
 * A task with its assigned contacts, for display only.
 */
export interface TaskWithContacts extends Task {
  assignedContacts: IUser[];
}

/** This data is sent to Supabase when creating a task. */
export type TaskCreate = Omit<Task, 'id' | 'created_at'>;

/** When updating, individual fields may be passed. */
export type TaskUpdate = Partial<TaskCreate>;

/**
 * A subtask with title and completed status.
 */
export interface Subtask {
  title: string;
  completed: boolean;
}

/**
 * New column and position of a card after drag & drop.
 */
export interface TaskPositionChange {
  id: number;
  status: TaskStatus;
  position: number;
}
