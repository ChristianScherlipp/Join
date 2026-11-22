import { computed, inject, Injectable, signal } from '@angular/core';
import {
    Task,
    TaskCreate,
    TaskStatus,
    TaskPositionChange,
    TaskUpdate,
    TaskWithContacts,
} from '../interfaces/task';
import { IUser } from '../interfaces/iuser';
import { Subject } from 'rxjs';
import { Supabase } from './supabase';
import { ContactService } from './contact-service';

const TASK_COLUMNS =
    'id, created_at, title, date, worker_id, subtask, ' +
    'category, priority, description, status, position';

interface LoadContext {
    load: number;
    revision: number;
}

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
        this.connectTasksWithContacts()
    );

    readonly tasksByStatus = computed(() => ({
        todo: this.filterByStatus('todo'),
        progress: this.filterByStatus('progress'),
        await: this.filterByStatus('await'),
        done: this.filterByStatus('done'),
    }));

    // Lädt Tasks und Kontakte parallel.
    async loadBoard(): Promise<void> {
        await Promise.all([
            this.getTasks(),
            this.contactService.getUsers(),
        ]);
    }

    // Steuert den Ladevorgang und die Fehlerbehandlung.
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

    // Erstellt einen Task.
    async addTask(task: TaskCreate): Promise<boolean> {
        return this.save(
            () => this.insertTask(task),
            'Der Task konnte nicht gespeichert werden.',
        );
    }

    // Ändert die übergebenen Felder eines Tasks.
    async updateTask(id: number, changes: TaskUpdate): Promise<boolean> {
        if (Object.keys(changes).length === 0) {
            return true;
        }
        return this.save(
            () => this.changeTask(id, changes),
            'Der Task konnte nicht geändert werden.',
        );
    }

    // Ändert nur den Status.
    updateStatus(id: number, status: TaskStatus): Promise<boolean> {
        return this.updateTask(id, { status });
    }

    // Speichert Spalte und Position mehrerer Tasks (Drag & Drop).
    async updatePositions(changes: TaskPositionChange[]): Promise<boolean> {
        if (changes.length === 0) return true;
        const saved = await this.save(
            () => this.changePositions(changes),
            'Die Reihenfolge konnte nicht gespeichert werden.',
        );
        if (!saved) await this.getTasks();
        return saved;
    }

    // Ersetzt die zugewiesenen Kontakt-IDs ohne Duplikate.
    updateWorkers(id: number, contactIds: number[]): Promise<boolean> {
        return this.updateTask(id, {
            worker_id: [...new Set(contactIds)],
        });
    }

    // Löscht einen Task.
    // async deleteTask(id: number): Promise<boolean> {
    //     return this.save(
    //         () => this.removeTask(id),
    //         'Der Task konnte nicht gelöscht werden.',
    //     );
    // }
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

    // Verknüpft die Task-Liste mit den geladenen Kontakten.
    private connectTasksWithContacts(): TaskWithContacts[] {
        const contacts = new Map(
            this.contactService.users().map(contact => [contact.id, contact]),
        );
        return this.tasks().map(task => ({
            ...task,
            assignedContacts: this.findContacts(task, contacts),
        }));
    }

    // Ermittelt die Kontakte eines einzelnen Tasks.
    private findContacts(task: Task, contacts: Map<number, IUser>): IUser[] {
        return (task.worker_id ?? []).flatMap(id => {
            const contact = contacts.get(id);
            return contact ? [contact] : [];
        });
    }

    // Liefert Tasks eines Status, sortiert nach Position (leere ans Ende).
    private filterByStatus(status: TaskStatus): TaskWithContacts[] {
        return this.tasksWithContacts()
            .filter(task => task.status === status)
            .sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
    }

    // Merkt sich den Zustand beim Start einer Ladeanfrage.
    private beginLoading(): LoadContext {
        this.loadingState.set(true);
        this.errorMessage.set('');
        return {
            load: ++this.latestLoad,
            revision: this.revision,
        };
    }

    // Fragt die Tasks ab und übernimmt nur eine aktuelle Antwort.
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

    // Prüft, ob inzwischen eine neuere Anfrage oder Änderung vorliegt.
    private isCurrentLoad(context: LoadContext): boolean {
        return context.load === this.latestLoad &&
            context.revision === this.revision;
    }

    // Zeigt Fehler überholter Ladeanfragen nicht mehr an.
    private handleLoadError(error: unknown, context: LoadContext): false {
        if (this.isCurrentLoad(context)) {
            this.handleError(error, 'Die Tasks konnten nicht geladen werden.');
        }
        return false;
    }

    // Nur die neueste Anfrage darf den Ladezustand zurücksetzen.
    private finishLoading(context: LoadContext): void {
        if (context.load === this.latestLoad) {
            this.loadingState.set(false);
        }
    }

    // Speichert den neuen Task und ergänzt die lokale Liste.
    private async insertTask(task: TaskCreate): Promise<void> {
        const { data, error } = await this.supabase
            .from('task')
            .insert(task)
            .select(TASK_COLUMNS)
            .single<Task>();
        if (error) throw error;
        this.prependTask(data);
    }

    // Ändert die Positionen zuerst lokal und speichert sie dann in Supabase.
    private async changePositions(changes: TaskPositionChange[]): Promise<void> {
        this.applyPositions(changes);
        const results = await Promise.all(
            changes.map(({ id, status, position }) =>
                this.supabase.from('task').update({ status, position }).eq('id', id),
            ),
        );
        const failed = results.find(result => result.error);
        if (failed?.error) throw failed.error;
    }

    // Übernimmt neue Spalte und Position in die lokale Liste.
    private applyPositions(changes: TaskPositionChange[]): void {
        const changeById = new Map(changes.map(change => [change.id, change]));
        this.taskState.update(tasks =>
            tasks.map(task => {
                const change = changeById.get(task.id);
                return change ? { ...task, status: change.status, position: change.position } : task;
            }),
        );
    }

    // Aktualisiert den Task in Supabase und anschließend lokal.
    private async changeTask(id: number, changes: TaskUpdate): Promise<void> {
        const { data, error } = await this.supabase
            .from('task')
            .update(changes)
            .eq('id', id)
            .select(TASK_COLUMNS)
            .single<Task>();
        if (error) throw error;
        this.replaceTask(data);
    }

    // Löscht den Datensatz und entfernt ihn aus der lokalen Liste.
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

    // Fügt einen Task vorne ein und verhindert doppelte Einträge.
    private prependTask(task: Task): void {
        this.taskState.update(tasks => [
            task,
            ...tasks.filter(existing => existing.id !== task.id),
        ]);
    }

    // Ersetzt einen Task oder ergänzt einen bisher nicht geladenen Task.
    private replaceTask(task: Task): void {
        this.taskState.update(tasks =>
            tasks.some(existing => existing.id === task.id)
                ? tasks.map(existing => existing.id === task.id ? task : existing)
                : [task, ...tasks],
        );
    }

    // Verhindert parallele Schreibvorgänge und behandelt Fehler.
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

    // Startet einen Schreibvorgang.
    private beginSaving(): void {
        this.savingState.set(true);
        this.errorMessage.set('');
        ++this.revision;
    }

    // Beendet einen Schreibvorgang auch nach einem Fehler.
    private finishSaving(): void {
        ++this.revision;
        this.savingState.set(false);
    }

    // Protokolliert den Fehler und setzt die Meldung für die Oberfläche.
    private handleError(error: unknown, message: string): false {
        console.error(message, error);
        this.errorMessage.set(message);
        return false;
    }
}