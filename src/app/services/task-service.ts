import { computed, inject, Injectable, signal } from '@angular/core';
import {
    Task,
    TaskCreate,
    TaskStatus,
    TaskPositionChange,
    TaskUpdate,
    TaskWithContacts,
} from '../interfaces/task';
import { Subject } from 'rxjs';
import { Supabase } from './supabase';
import { ContactService } from './contact-service';
import {
    applyPositions,
    connectTasksWithContacts,
    prependTask,
    replaceTask,
} from './task-list';

const TASK_COLUMNS =
    'id, created_at, title, date, worker_id, subtask, ' +
    'category, priority, description, status, position';

/**
 * Remembers the state at the start of a load request.
 */
interface LoadContext {
    load: number;
    revision: number;
}

/**
 * Manages all tasks: loading, creating, updating, deleting and positions.
 */
@Injectable({
    providedIn: 'root',
})
export class TaskService {
    private readonly supabase = inject(Supabase).supabase;
    private readonly contactService = inject(ContactService);

    private readonly taskState = signal<Task[]>([]);
    private readonly loadingState = signal(false);
    private readonly savingState = signal(false);

    private latestLoad = 0;
    private revision = 0;

    readonly tasks = this.taskState.asReadonly();
    readonly loading = this.loadingState.asReadonly();
    readonly saving = this.savingState.asReadonly();
    readonly taskDeleted = new Subject<void>();

    readonly errorMessage = signal('');
    readonly contactErrorMessage = this.contactService.errorMessage;

    readonly tasksWithContacts = computed(() =>
        connectTasksWithContacts(this.tasks(), this.contactService.users())
    );

    readonly tasksByStatus = computed(() => ({
        todo: this.filterByStatus('todo'),
        progress: this.filterByStatus('progress'),
        await: this.filterByStatus('await'),
        done: this.filterByStatus('done'),
    }));

    /**
     * Loads tasks and contacts in parallel.
     *
     * @returns {Promise<void>}
     */
    async loadBoard(): Promise<void> {
        await Promise.all([
            this.getTasks(),
            this.contactService.getUsers(),
        ]);
    }

    /**
     * Controls the loading process and error handling.
     *
     * @returns {Promise<boolean>} true if an up-to-date response was accepted.
     */
    async getTasks(): Promise<boolean> {
        const context = this.beginLoading();
        try {
            return await this.loadTasks(context);
        } catch (error) {
            return this.handleLoadError(error, context);
        } finally {
            this.finishLoading(context);
        }
    }

    /**
     * Creates a task.
     *
     * @param {TaskCreate} task - The data of the new task.
     * @returns {Promise<boolean>} true = saved, false = failed.
     */
    async addTask(task: TaskCreate): Promise<boolean> {
        return this.save(
            () => this.insertTask(task),
            'Der Task konnte nicht gespeichert werden.',
        );
    }

    /**
     * Updates the given fields of a task.
     *
     * @param {number} id - The ID of the task.
     * @param {TaskUpdate} changes - The fields to update.
     * @returns {Promise<boolean>} true = saved, false = failed.
     */
    async updateTask(id: number, changes: TaskUpdate): Promise<boolean> {
        if (Object.keys(changes).length === 0) {
            return true;
        }
        return this.save(
            () => this.changeTask(id, changes),
            'Der Task konnte nicht geändert werden.',
        );
    }

    /**
     * Updates only the status of a task.
     *
     * @param {number} id - The ID of the task.
     * @param {TaskStatus} status - The new status.
     * @returns {Promise<boolean>} true = saved, false = failed.
     */
    updateStatus(id: number, status: TaskStatus): Promise<boolean> {
        return this.updateTask(id, { status });
    }

    /**
     * Saves column and position of several tasks (drag & drop).
     * On error the tasks are reloaded.
     *
     * @param {TaskPositionChange[]} changes - The new columns and positions.
     * @returns {Promise<boolean>} true = saved, false = failed.
     */
    async updatePositions(changes: TaskPositionChange[]): Promise<boolean> {
        if (changes.length === 0) return true;
        const saved = await this.save(
            () => this.changePositions(changes),
            'Die Reihenfolge konnte nicht gespeichert werden.',
        );
        if (!saved) await this.getTasks();
        return saved;
    }

    /**
     * Replaces the assigned contact IDs without duplicates.
     *
     * @param {number} id - The ID of the task.
     * @param {number[]} contactIds - The IDs of the assigned contacts.
     * @returns {Promise<boolean>} true = saved, false = failed.
     */
    updateWorkers(id: number, contactIds: number[]): Promise<boolean> {
        return this.updateTask(id, {
            worker_id: [...new Set(contactIds)],
        });
    }

    /**
     * Deletes a task and then reports the deletion via taskDeleted.
     *
     * @param {number} id - The ID of the task.
     * @returns {Promise<boolean>} true = deleted, false = failed.
     */
    async deleteTask(id: number): Promise<boolean> {
        const success = await this.save(
            () => this.removeTask(id),
            'Der Task konnte nicht gelöscht werden.'
        );

        if (success) {
            this.taskDeleted.next();
        }

        return success;
    }

    /**
     * Returns the tasks of a status sorted by position (empty ones last).
     *
     * @param {TaskStatus} status - The requested status.
     * @returns {TaskWithContacts[]} The sorted tasks.
     */
    private filterByStatus(status: TaskStatus): TaskWithContacts[] {
        return this.tasksWithContacts()
            .filter(task => task.status === status)
            .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
    }

    /**
     * Remembers the state at the start of a load request.
     *
     * @returns {LoadContext} Number of the request and current revision.
     */
    private beginLoading(): LoadContext {
        this.loadingState.set(true);
        this.errorMessage.set('');
        return {
            load: ++this.latestLoad,
            revision: this.revision,
        };
    }

    /**
     * Queries the tasks and accepts only an up-to-date response.
     *
     * @param {LoadContext} context - The state at the start of the request.
     * @returns {Promise<boolean>} true if the response was accepted.
     * @throws The Supabase error if the query fails.
     */
    private async loadTasks(context: LoadContext): Promise<boolean> {
        const { data, error } = await this.supabase
            .from('task')
            .select(TASK_COLUMNS)
            .order('id', { ascending: false })
            .returns<Task[]>();
        if (error) throw error;
        if (!this.isCurrentLoad(context)) return false;
        this.taskState.set(data ?? []);
        return true;
    }

    /**
     * Checks whether the request is still current or a newer one exists.
     *
     * @param {LoadContext} context - The state at the start of the request.
     * @returns {boolean} true if the request is still current.
     */
    private isCurrentLoad(context: LoadContext): boolean {
        return context.load === this.latestLoad &&
            context.revision === this.revision;
    }

    /**
     * No longer shows errors of outdated load requests.
     *
     * @param {unknown} error - The error that occurred.
     * @param {LoadContext} context - The state at the start of the request.
     * @returns {false} Always false.
     */
    private handleLoadError(error: unknown, context: LoadContext): false {
        if (this.isCurrentLoad(context)) {
            this.handleError(error, 'Die Tasks konnten nicht geladen werden.');
        }
        return false;
    }

    /**
     * Resets the loading state, but only for the latest request.
     *
     * @param {LoadContext} context - The state at the start of the request.
     * @returns {void}
     */
    private finishLoading(context: LoadContext): void {
        if (context.load === this.latestLoad) {
            this.loadingState.set(false);
        }
    }

    /**
     * Saves the new task and adds it to the local list.
     *
     * @param {TaskCreate} task - The data of the new task.
     * @returns {Promise<void>}
     * @throws The Supabase error if saving fails.
     */
    private async insertTask(task: TaskCreate): Promise<void> {
        const { data, error } = await this.supabase
            .from('task')
            .insert(task)
            .select(TASK_COLUMNS)
            .single<Task>();
        if (error) throw error;
        this.taskState.update(tasks => prependTask(tasks, data));
    }

    /**
     * Changes the positions locally first and then saves them in Supabase.
     *
     * @param {TaskPositionChange[]} changes - The new columns and positions.
     * @returns {Promise<void>}
     * @throws The first Supabase error if a save fails.
     */
    private async changePositions(changes: TaskPositionChange[]): Promise<void> {
        this.taskState.update(tasks => applyPositions(tasks, changes));
        const results = await Promise.all(
            changes.map(({ id, status, position }) =>
                this.supabase.from('task').update({ status, position }).eq('id', id),
            ),
        );
        const failed = results.find(result => result.error);
        if (failed?.error) throw failed.error;
    }

    /**
     * Updates the task in Supabase and then locally.
     *
     * @param {number} id - The ID of the task.
     * @param {TaskUpdate} changes - The fields to update.
     * @returns {Promise<void>}
     * @throws The Supabase error if saving fails.
     */
    private async changeTask(id: number, changes: TaskUpdate): Promise<void> {
        const { data, error } = await this.supabase
            .from('task')
            .update(changes)
            .eq('id', id)
            .select(TASK_COLUMNS)
            .single<Task>();
        if (error) throw error;
        this.taskState.update(tasks => replaceTask(tasks, data));
    }

    /**
     * Deletes the record and removes it from the local list.
     *
     * @param {number} id - The ID of the task.
     * @returns {Promise<void>}
     * @throws The Supabase error if deleting fails.
     */
    private async removeTask(id: number): Promise<void> {
        const { error } = await this.supabase
            .from('task')
            .delete()
            .eq('id', id)
            .select('id')
            .single<{ id: number }>();
        if (error) throw error;
        this.taskState.update(tasks => tasks.filter(task => task.id !== id));
    }

    /**
     * Prevents parallel write operations and handles errors.
     *
     * @param {() => Promise<void>} operation - The write operation to run.
     * @param {string} message - The message on error.
     * @returns {Promise<boolean>} true = successful, false = failed or blocked.
     */
    private async save(operation: () => Promise<void>, message: string): Promise<boolean> {
        if (this.saving()) return false;
        this.beginSaving();
        try {
            await operation();
            return true;
        } catch (error) {
            return this.handleError(error, message);
        } finally {
            this.finishSaving();
        }
    }

    /**
     * Starts a write operation.
     *
     * @returns {void}
     */
    private beginSaving(): void {
        this.savingState.set(true);
        this.errorMessage.set('');
        ++this.revision;
    }

    /**
     * Ends a write operation, also after an error.
     *
     * @returns {void}
     */
    private finishSaving(): void {
        ++this.revision;
        this.savingState.set(false);
    }

    /**
     * Sets the error message for the UI.
     *
     * @param {unknown} error - The error that occurred.
     * @param {string} message - The message for the user.
     * @returns {false} Always false.
     */
    private handleError(error: unknown, message: string): false {
        this.errorMessage.set(message);
        return false;
    }
}