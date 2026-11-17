// task-edit-dialog.ts

import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  Subtask,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  TaskWithContacts,
} from '../../../interfaces/task';
import { TaskService } from '../../../services/task-service';
import { ContactService } from '../../../services/contact-service';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonPriority } from '../../elements/button-priority/button-priority';
import { ButtonEditDelete } from '../../elements/button-edit-delete/button-edit-delete';

@Component({
  selector: 'app-task-edit-dialog',
  imports: [
    FormsModule,
    ButtonPrimary,
    ButtonPriority,
    ButtonEditDelete,
  ],
  templateUrl: './task-edit-dialog.html',
  styleUrl: './task-edit-dialog.scss',
})
export class TaskEditDialog implements OnInit, AfterViewInit, OnDestroy {
  readonly task = input.required<TaskWithContacts>();

  readonly closed = output<void>();
  readonly saved = output<void>();

  readonly taskService = inject(TaskService);
  readonly contactService = inject(ContactService);

  readonly dialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly subtaskEditInput =
    viewChild<ElementRef<HTMLInputElement>>('subtaskEditInput');

  private readonly opener = document.activeElement as HTMLElement | null;

  title = '';
  description = '';
  date = '';

  category: TaskCategory | '' = '';
  priority: TaskPriority | null = null;
  status: TaskStatus | '' = '';

  workerIds: number[] = [];
  subtasks: Subtask[] = [];

  newSubtask = '';
  editingSubtaskIndex: number | null = null;
  editingSubtaskTitle = '';
  subtaskError = '';

  validationMessage = '';
  submitted = false;

  readonly statuses: { value: TaskStatus; label: string }[] = [
    { value: 'todo', label: 'To do' },
    { value: 'progress', label: 'In progress' },
    { value: 'await', label: 'Await feedback' },
    { value: 'done', label: 'Done' },
  ];

  ngOnInit(): void {
    const task = this.task();

    this.title = task.title ?? '';
    this.description = task.description ?? '';
    this.date = task.date ?? '';
    this.category = task.category ?? '';
    this.priority = task.priority;
    this.status = task.status ?? '';

    this.workerIds = [...(task.worker_id ?? [])];
    this.subtasks = (task.subtask ?? []).map(subtask => ({ ...subtask }));

    this.taskService.errorMessage.set('');
    void this.contactService.getUsers();
  }

  ngAfterViewInit(): void {
    this.dialog().nativeElement.showModal();
  }

  ngOnDestroy(): void {
    this.opener?.focus();
  }

  close(): void {
    if (!this.taskService.saving()) {
      this.closed.emit();
    }
  }

  toggleWorker(id: number): void {
    if (this.taskService.saving()) return;

    this.workerIds = this.workerIds.includes(id)
      ? this.workerIds.filter(workerId => workerId !== id)
      : [...this.workerIds, id];
  }

  missingWorkerIds(): number[] {
    return this.workerIds.filter(
      id => !this.contactService.users().some(contact => contact.id === id)
    );
  }

  addSubtask(): void {
    if (this.taskService.saving()) return;

    const title = this.newSubtask.trim();

    if (!title) return;

    if (!this.commitSubtaskEdit()) return;

    this.subtasks = [...this.subtasks, { title, completed: false }];
    this.newSubtask = '';
    this.subtaskError = '';
  }

  startSubtaskEdit(index: number): void {
    if (this.taskService.saving()) return;
    if (this.editingSubtaskIndex === index) return;
    if (!this.commitSubtaskEdit()) return;

    const subtask = this.subtasks[index];
    if (!subtask) return;

    this.editingSubtaskIndex = index;
    this.editingSubtaskTitle = subtask.title;
    this.subtaskError = '';

    // Warten, bis Angular das bedingt eingeblendete Eingabefeld erstellt hat.
    setTimeout(() => {
      const input = this.subtaskEditInput()?.nativeElement;
      input?.focus();
      input?.select();
    });
  }

  commitSubtaskEdit(): boolean {
    if (this.editingSubtaskIndex === null) return true;

    const title = this.editingSubtaskTitle.trim();

    if (!title) {
      this.subtaskError = 'Bitte einen Titel für die Unteraufgabe eingeben.';
      this.subtaskEditInput()?.nativeElement.focus();
      return false;
    }

    const index = this.editingSubtaskIndex;

    this.subtasks = this.subtasks.map((subtask, currentIndex) =>
      currentIndex === index ? { ...subtask, title } : subtask
    );

    this.cancelSubtaskEdit();
    return true;
  }

  cancelSubtaskEdit(): void {
    this.editingSubtaskIndex = null;
    this.editingSubtaskTitle = '';
    this.subtaskError = '';
  }

  removeSubtask(index: number): void {
    if (this.taskService.saving()) return;

    this.subtasks = this.subtasks.filter(
      (_, currentIndex) => currentIndex !== index
    );

    if (this.editingSubtaskIndex === index) {
      this.cancelSubtaskEdit();
    } else if (
      this.editingSubtaskIndex !== null &&
      this.editingSubtaskIndex > index
    ) {
      this.editingSubtaskIndex--;
    }
  }

  async save(form: NgForm): Promise<void> {
    if (this.taskService.saving()) return;

    this.submitted = true;
    this.validationMessage = '';

    if (!this.commitSubtaskEdit()) return;

    if (
      form.invalid ||
      !this.title.trim() ||
      !this.date ||
      !this.category ||
      !this.priority ||
      !this.status
    ) {
      form.control.markAllAsTouched();
      this.validationMessage = 'Bitte alle Pflichtfelder ausfüllen.';
      return;
    }

    const subtasks = this.subtasks.map(subtask => ({
      title: subtask.title.trim(),
      completed: subtask.completed,
    }));

    if (subtasks.some(subtask => !subtask.title)) {
      this.subtaskError = 'Jede Unteraufgabe benötigt einen Titel.';
      return;
    }

    if (this.newSubtask.trim()) {
      subtasks.push({
        title: this.newSubtask.trim(),
        completed: false,
      });
    }

    const success = await this.taskService.updateTask(this.task().id, {
      title: this.title.trim(),
      description: this.description,
      date: this.date,
      category: this.category,
      priority: this.priority,
      status: this.status,
      worker_id: this.workerIds.length
        ? [...new Set(this.workerIds)]
        : null,
      subtask: subtasks,
    });

    if (success) {
      this.saved.emit();
    }
  }
}