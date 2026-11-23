import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import {
  Subtask as TaskSubtask,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  TaskUpdate,
  TaskWithContacts,
} from '../../../interfaces/task';
import { IUser } from '../../../interfaces/iuser';

import { TaskService } from '../../../services/task-service';
import { ContactService } from '../../../services/contact-service';

import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonPriority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';
import { Subtask, ISubtask } from '../../elements/subtask/subtask';

/**
 * A subtask in the form. Keeps the completed status of existing subtasks.
 */
interface EditableSubtask extends ISubtask {
  completed?: boolean;
}

/**
 * Dialog for editing an existing task.
 */
@Component({
  selector: 'app-task-edit-dialog',
  imports: [
    FormsModule,
    ButtonPrimary,
    ButtonPriority,
    DropDownAssignedto,
    Subtask,
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

  private readonly opener =
    document.activeElement as HTMLElement | null;

  private closeTimer?: ReturnType<typeof setTimeout>;

  /** Controls the CSS class for the closing animation. */
  readonly isClosing = signal(false);

  title = '';
  description = '';
  date = '';

  category: TaskCategory | '' = '';
  priority: TaskPriority | null = null;
  status: TaskStatus | '' = '';

  selectedContacts: Pick<IUser, 'id' | 'name'>[] = [];

  readonly subtasks = signal<EditableSubtask[]>([]);

  validationMessage = '';
  submitted = false;

  /**
   * Copies the existing task data into the form.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    const task = this.task();

    this.title = task.title ?? '';
    this.description = task.description ?? '';
    this.date = task.date ?? '';
    this.category = task.category ?? '';
    this.priority = task.priority;
    this.status = task.status ?? '';
    this.selectedContacts = this.mapAssignedContacts(task);
    this.subtasks.set(this.mapSubtasks(task));
    this.taskService.errorMessage.set('');
    void this.contactService.getUsers();
  }

  /**
   * Opens the dialog as soon as the HTML is ready.
   *
   * @returns {void}
   */
  ngAfterViewInit(): void {
    this.dialog().nativeElement.showModal();
  }

  /**
   * Cleans up the timer and returns the focus.
   *
   * @returns {void}
   */
  ngOnDestroy(): void {
    clearTimeout(this.closeTimer);
    this.opener?.focus();
  }

  /**
   * Reports the closing after the animation has finished.
   *
   * @returns {void}
   */
  close(): void {
    if (this.taskService.saving()) {
      return;
    }

    this.closeWithAnimation(() => this.closed.emit());
  }

  /**
   * Detects clicks outside the dialog window.
   *
   * @param {MouseEvent} event - The click event.
   * @returns {void}
   */
  closeOnOutsideClick(event: MouseEvent): void {
    const dialog = event.currentTarget as HTMLDialogElement;
    const bounds = dialog.getBoundingClientRect();

    const isOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (event.target === dialog && isOutside) {
      this.close();
    }
  }

  /**
   * Validates and saves the form.
   * After saving successfully the closing animation runs.
   *
   * @param {NgForm} form - The form of the dialog.
   * @returns {Promise<void>}
   */
  async save(form: NgForm): Promise<void> {
    if (this.taskService.saving() || this.isClosing()) return;

    this.submitted = true;
    this.validationMessage = '';

    if (!this.isFormValid(form)) return this.showValidationError(form);

    const success = await this.taskService.updateTask(this.task().id, this.buildChanges());

    if (success) {
      this.closeWithAnimation(() => this.saved.emit());
    }
  }

  /**
   * Marks all fields as touched and shows the message for missing required fields.
   *
   * @param {NgForm} form - The form of the dialog.
   * @returns {void}
   */
  private showValidationError(form: NgForm): void {
    form.control.markAllAsTouched();
    this.validationMessage = 'Bitte alle Pflichtfelder ausfüllen.';
  }

  /**
   * Converts the assigned contact IDs of the task into selection entries.
   *
   * @param {TaskWithContacts} task - The edited task.
   * @returns {Pick<IUser, 'id' | 'name'>[]} The contacts for the dropdown.
   */
  private mapAssignedContacts(task: TaskWithContacts): Pick<IUser, 'id' | 'name'>[] {
    return (task.worker_id ?? []).map(id => {
      const contact = task.assignedContacts.find(entry => entry.id === id);

      return { id, name: contact?.name ?? `Kontakt #${id}` };
    });
  }

  /**
   * Adds local IDs and keeps existing checkmarks of the subtasks.
   *
   * @param {TaskWithContacts} task - The edited task.
   * @returns {EditableSubtask[]} The subtasks for the form.
   */
  private mapSubtasks(task: TaskWithContacts): EditableSubtask[] {
    return (task.subtask ?? []).map((subtask, index) => ({
      id: index + 1,
      title: subtask.title,
      completed: subtask.completed,
    }));
  }

  /**
   * Checks whether all required fields of the form are filled in.
   *
   * @param {NgForm} form - The form of the dialog.
   * @returns {boolean} true if the form may be saved.
   */
  private isFormValid(form: NgForm): boolean {
    const filled = !!this.title.trim() && !!this.date && !!this.category;
    return !form.invalid && filled && !!this.priority && !!this.status;
  }

  /**
   * Builds the changes to save from the form.
   * New subtasks are initially not completed.
   *
   * @returns {TaskUpdate} The changes for the service.
   */
  private buildChanges(): TaskUpdate {
    return {
      title: this.title.trim(),
      description: this.description,
      date: this.date,
      category: this.category || null,
      priority: this.priority,
      status: this.status || null,
      worker_id: this.selectedContacts.map(contact => contact.id),
      subtask: this.toSubtasks(),
    };
  }

  /**
   * Converts the subtasks of the form into the data for Supabase.
   * The local form ID is not saved.
   *
   * @returns {TaskSubtask[]} The subtasks with title and completed status.
   */
  private toSubtasks(): TaskSubtask[] {
    return this.subtasks().map(subtask => ({
      title: subtask.title,
      completed: subtask.completed ?? false,
    }));
  }

  /**
   * Plays the closing animation and then runs the given action.
   *
   * @param {() => void} action - The action after the animation.
   * @returns {void}
   */
  private closeWithAnimation(action: () => void): void {
    if (this.isClosing()) {
      return;
    }

    this.isClosing.set(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.closeTimer = setTimeout(action, reducedMotion ? 0 : 400);
  }
}
