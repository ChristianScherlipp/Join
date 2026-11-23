import { IUser } from '../interfaces/iuser';
import { Task, TaskPositionChange, TaskWithContacts } from '../interfaces/task';

/**
 * Links the task list with the loaded contacts.
 *
 * @param {Task[]} tasks - The tasks.
 * @param {IUser[]} users - All loaded contacts.
 * @returns {TaskWithContacts[]} The tasks including assigned contacts.
 */
export function connectTasksWithContacts(tasks: Task[], users: IUser[]): TaskWithContacts[] {
  const contacts = new Map(users.map(contact => [contact.id, contact]));
  return tasks.map(task => ({ ...task, assignedContacts: findContacts(task, contacts) }));
}

/**
 * Determines the contacts of a single task.
 *
 * @param {Task} task - The task.
 * @param {Map<number, IUser>} contacts - All contacts by ID.
 * @returns {IUser[]} The contacts assigned to the task.
 */
function findContacts(task: Task, contacts: Map<number, IUser>): IUser[] {
  return (task.worker_id ?? []).flatMap(id => {
    const contact = contacts.get(id);
    return contact ? [contact] : [];
  });
}

/**
 * Applies the new column and position to the task list.
 *
 * @param {Task[]} tasks - The previous tasks.
 * @param {TaskPositionChange[]} changes - The new columns and positions.
 * @returns {Task[]} The tasks with the new columns and positions.
 */
export function applyPositions(tasks: Task[], changes: TaskPositionChange[]): Task[] {
  const changeById = new Map(changes.map(change => [change.id, change]));
  return tasks.map(task => {
    const change = changeById.get(task.id);
    return change ? { ...task, status: change.status, position: change.position } : task;
  });
}

/**
 * Inserts a task at the front and prevents duplicate entries.
 *
 * @param {Task[]} tasks - The previous tasks.
 * @param {Task} task - The task to insert.
 * @returns {Task[]} The tasks with the new task in first place.
 */
export function prependTask(tasks: Task[], task: Task): Task[] {
  return [task, ...tasks.filter(existing => existing.id !== task.id)];
}

/**
 * Replaces a task or adds a task that was not loaded before.
 *
 * @param {Task[]} tasks - The previous tasks.
 * @param {Task} task - The updated task.
 * @returns {Task[]} The tasks including the updated task.
 */
export function replaceTask(tasks: Task[], task: Task): Task[] {
  return tasks.some(existing => existing.id === task.id)
    ? tasks.map(existing => existing.id === task.id ? task : existing)
    : [task, ...tasks];
}
