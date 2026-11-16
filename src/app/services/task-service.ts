import { computed, inject, Injectable, signal } from '@angular/core';
import {
    Task,
    TaskCreate,
    TaskStatus,
    TaskUpdate,
    TaskWithContacts,
} from '../interfaces/task';
import { Supabase } from './supabase';
import { ContactService } from './contact-service';

const TASK_COLUMNS =
    'id, created_at, title, date, worker_id, subtask, ' +
    'category, priority, description, status';

@Injectable({
    providedIn: 'root',
})
export class TaskService {
    private readonly supabase = inject(Supabase).supabase;
    private readonly contactService = inject(ContactService);

    private readonly taskState = signal<Task[]>([]);
    private readonly loadingState = signal(false);
    private readonly savingState = signal(false);

    // Schützt vor veralteten Ladeantworten.
    private latestLoad = 0;
    private revision = 0;

    readonly tasks = this.taskState.asReadonly();
    readonly loading = this.loadingState.asReadonly();
    readonly saving = this.savingState.asReadonly();

    readonly errorMessage = signal('');

    // Fehler beim Laden der Kontakte werden vom ContactService verwaltet.
    readonly contactErrorMessage = this.contactService.errorMessage;

    /**
     * Ergänzt jeden Task um seine zugewiesenen Kontakte.
     *
     * Beispiel:
     * worker_id: [1, 3]
     * assignedContacts: [Kontakt mit ID 1, Kontakt mit ID 3]
     */
    readonly tasksWithContacts = computed<TaskWithContacts[]>(() => {
        const contactsById = new Map(
            this.contactService.users().map(contact => [
                contact.id,
                contact,
            ]),
        );

        return this.tasks().map(task => ({
            ...task,
            assignedContacts: (task.worker_id ?? []).flatMap(id => {
                const contact = contactsById.get(id);

                return contact ? [contact] : [];
            }),
        }));
    });

    /**
     * Gruppiert die Tasks inklusive Kontakte für das Board.
     */
    readonly tasksByStatus = computed(() => {
        const tasks = this.tasksWithContacts();

        return {
            todo: tasks.filter(task => task.status === 'todo'),
            progress: tasks.filter(task => task.status === 'progress'),
            await: tasks.filter(task => task.status === 'await'),
            done: tasks.filter(task => task.status === 'done'),
        };
    });

    /**
     * Lädt Tasks und Kontakte.
     * Beim Öffnen des Boards aufrufen.
     */
    async loadBoard(): Promise<void> {
        await Promise.all([
            this.getTasks(),
            this.contactService.getUsers(),
        ]);
    }

    /**
     * Lädt die Tasks aus der Tabelle "task".
     */
    async getTasks(): Promise<boolean> {
        const load = ++this.latestLoad;
        const revision = this.revision;

        this.loadingState.set(true);
        this.errorMessage.set('');

        try {
            const { data, error } = await this.supabase
                .from('task')
                .select(TASK_COLUMNS)
                .order('id', { ascending: false })
                .returns<Task[]>();

            if (error) {
                throw error;
            }

            // Eine ältere Antwort darf neuere Daten nicht überschreiben.
            if (
                load !== this.latestLoad ||
                revision !== this.revision
            ) {
                return false;
            }

            this.taskState.set(data ?? []);

            return true;
        } catch (error) {
            if (
                load === this.latestLoad &&
                revision === this.revision
            ) {
                this.handleError(
                    error,
                    'Die Tasks konnten nicht geladen werden.',
                );
            }

            return false;
        } finally {
            if (load === this.latestLoad) {
                this.loadingState.set(false);
            }
        }
    }

    /**
     * Erstellt einen neuen Task.
     * worker_id enthält ausschließlich Kontakt-IDs.
     */
    async addTask(task: TaskCreate): Promise<boolean> {
        return this.save(async () => {
            const { data, error } = await this.supabase
                .from('task')
                .insert(task)
                .select(TASK_COLUMNS)
                .single<Task>();

            if (error) {
                throw error;
            }

            this.taskState.update(tasks => [
                data,
                ...tasks.filter(task => task.id !== data.id),
            ]);
        }, 'Der Task konnte nicht gespeichert werden.');
    }

    /**
     * Ändert einzelne Felder eines Tasks.
     */
    async updateTask(
        id: number,
        changes: TaskUpdate,
    ): Promise<boolean> {
        if (Object.keys(changes).length === 0) {
            return true;
        }

        return this.save(async () => {
            const { data, error } = await this.supabase
                .from('task')
                .update(changes)
                .eq('id', id)
                .select(TASK_COLUMNS)
                .single<Task>();

            if (error) {
                throw error;
            }

            this.taskState.update(tasks =>
                tasks.some(task => task.id === id)
                    ? tasks.map(task => task.id === id ? data : task)
                    : [data, ...tasks],
            );
        }, 'Der Task konnte nicht geändert werden.');
    }

    /**
     * Ändert den Status eines Tasks.
     */
    updateStatus(
        id: number,
        status: TaskStatus,
    ): Promise<boolean> {
        return this.updateTask(id, { status });
    }

    /**
     * Ersetzt die zugewiesenen Kontakte eines Tasks.
     * Ein leeres Array entfernt alle Zuweisungen.
     */
    updateWorkers(
        id: number,
        contactIds: number[],
    ): Promise<boolean> {
        return this.updateTask(id, {
            worker_id: [...new Set(contactIds)],
        });
    }

    /**
     * Löscht einen Task.
     */
    async deleteTask(id: number): Promise<boolean> {
        return this.save(async () => {
            const { error } = await this.supabase
                .from('task')
                .delete()
                .eq('id', id)
                .select('id')
                .single<{ id: number }>();

            if (error) {
                throw error;
            }

            this.taskState.update(tasks =>
                tasks.filter(task => task.id !== id),
            );
        }, 'Der Task konnte nicht gelöscht werden.');
    }

    /**
     * Gemeinsame Behandlung aller Schreibvorgänge.
     */
    private async save(
        operation: () => Promise<void>,
        message: string,
    ): Promise<boolean> {
        // Weitere Schreibvorgänge werden währenddessen abgewiesen.
        if (this.saving()) {
            return false;
        }

        this.savingState.set(true);
        this.errorMessage.set('');
        ++this.revision;

        try {
            await operation();

            return true;
        } catch (error) {
            this.handleError(error, message);

            return false;
        } finally {
            ++this.revision;
            this.savingState.set(false);
        }
    }

    private handleError(
        error: unknown,
        message: string,
    ): void {
        console.error(message, error);
        this.errorMessage.set(message);
    }
}