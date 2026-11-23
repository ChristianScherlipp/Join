import { Component, ElementRef, ViewChild, inject, output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FieldError } from '../../../services/field-error';
import { TaskService } from '../../../services/task-service';
import { ButtonPriority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { DropDownCategory } from '../../elements/drop-down-category/drop-down-category';
import { ISubtask, Subtask } from '../../elements/subtask/subtask';
import { ToastSuccess } from '../../elements/toast-succsess/toast-succsess';
import { IUser } from '../../../interfaces/iuser';
import {
  Subtask as TaskSubtask,
  TaskCategory,
  TaskCreate,
  TaskPriority,
  TaskStatus,
} from '../../../interfaces/task';

/**
 * Dialog for creating a task directly from a column of the board.
 */
@Component({
  imports: [ButtonPriority, DropDownAssignedto, ButtonPrimary, DropDownCategory, Subtask, FormsModule, ToastSuccess],
  providers: [FieldError],
  selector: 'app-add-task-dialog',
  styleUrl: './add-task-dialog.scss',
  templateUrl: './add-task-dialog.html',
})
export class AddTaskDialog {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  readonly fieldError = inject(FieldError);
  readonly taskService = inject(TaskService);

  /** Tells the parent component that a task was created. */
  readonly created = output<void>();

  @ViewChild('taskForm')
  private taskForm!: NgForm;

  @ViewChild('toast')
  private toast!: ToastSuccess;

  @ViewChild(Subtask)
  private subtaskComp!: Subtask;

  title = '';
  description = '';
  dueDate = '';
  priority: TaskPriority | null = 'medium';
  assignedContacts: IUser[] = [];
  category: TaskCategory | null = null;
  subtasks: ISubtask[] = [];
  status: TaskStatus = 'todo';

  /**
   * Opens the dialog for the column it was opened from.
   *
   * @param {TaskStatus} [status='todo'] - The status of the new task.
   * @returns {void}
   */
  open(status: TaskStatus = 'todo'): void {
    this.status = status;
    this.dialog.nativeElement.showModal();
  }

  /**
   * Prevents closing by outside click or Esc while saving.
   *
   * @param {Event} event - The cancel event of the dialog.
   * @returns {void}
   */
  onCancel(event: Event): void {
    if (this.taskService.saving()) event.preventDefault();
  }

  /**
   * Closes the dialog unless it is currently saving.
   * The form is cleared via the close event.
   *
   * @returns {void}
   */
  close(): void {
    if (this.taskService.saving()) return;
    this.dialog.nativeElement.close();
  }

  /**
   * Silently checks whether all required fields are valid (for the create button).
   *
   * @returns {boolean} true if title, date and category are filled in.
   */
  isFormValid(): boolean {
    return !!this.title.trim() && !!this.dueDate && !!this.category;
  }

  /**
   * Creates the task in the column the dialog was opened from.
   * On success the dialog is closed and a toast is shown.
   * On error the dialog and input are kept.
   *
   * @returns {Promise<void>}
   */
  async createTask(): Promise<void> {
    if (this.taskService.saving() || !this.validate()) return;
    const saved = await this.taskService.addTask(this.buildTask());
    if (saved) {
      this.close();
      this.toast.show('Task added to board');
      this.created.emit();
    }
  }

  /**
   * Clears the form and the error messages for the next task.
   *
   * @returns {void}
   */
  resetForm(): void {
    this.taskForm.resetForm();
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.priority = 'medium';
    this.assignedContacts = [];
    this.category = null;
    this.subtasks = [];
    this.subtaskComp.clearInput();
    this.status = 'todo';
    this.fieldError.reset();
    this.taskService.errorMessage.set('');
  }

  /**
   * Builds the data of the new task from the input.
   *
   * @returns {TaskCreate} The data for the service.
   */
  private buildTask(): TaskCreate {
    return {
      title: this.title.trim(),
      description: this.description.trim() || null,
      date: this.dueDate,
      worker_id: this.assignedContacts.map((contact) => contact.id),
      subtask: this.toSubtasks(),
      category: this.category,
      priority: this.priority,
      status: this.status,
      position: 0,
    };
  }

  /**
   * Converts the subtasks of the form into the data for Supabase.
   *
   * @returns {TaskSubtask[] | null} The subtasks or null if there are none.
   */
  private toSubtasks(): TaskSubtask[] | null {
    if (!this.subtasks.length) return null;
    return this.subtasks.map(({ title }) => ({ title, completed: false }));
  }

  /**
   * Validates all required fields at once so that all errors (including category) are shown.
   *
   * @returns {boolean} true if all required fields are valid.
   */
  private validate(): boolean {
    const results = [
      this.fieldError.check('title', this.title),
      this.fieldError.check('dueDate', this.dueDate),
      this.fieldError.check('category', this.category ?? ''),
    ];
    return results.every(Boolean);
  }
}
