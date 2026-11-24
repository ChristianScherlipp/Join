import { Component, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonPriority, Priority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';
import { Category, DropDownCategory } from '../../elements/drop-down-category/drop-down-category';
import { ISubtask, Subtask } from '../../elements/subtask/subtask';
import { FieldError } from '../../../services/field-error';
import { TaskService } from '../../../services/task-service';
import { TaskCreate } from '../../../interfaces/task';
import { IUser } from '../../../interfaces/iuser';
import { ToastSuccess } from '../../elements/toast-succsess/toast-succsess';

/**
 * Page for creating a new task.
 */
@Component({
  imports: [ButtonPrimary, ButtonPriority, DropDownAssignedto, DropDownCategory, Subtask, FormsModule, ToastSuccess],
  providers: [FieldError],
  selector: 'app-add-task',
  styleUrl: './add-task.scss',
  templateUrl: './add-task.html',
})
export class AddTask {
  readonly fieldError = inject(FieldError);
  readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  @ViewChild('taskForm')
  private taskForm!: NgForm;

  @ViewChild('toast')
  private toast!: ToastSuccess;

  @ViewChild(Subtask)
  private subtaskComp!: Subtask;

  title = '';
  description = '';
  dueDate = '';
  readonly today = new Date().toLocaleDateString('en-CA');

  readonly priority = signal<Priority | null>('medium');
  readonly assignedContacts = signal<Pick<IUser, 'id' | 'name'>[]>([]);
  readonly category = signal<Category | null>(null);
  readonly subtasks = signal<ISubtask[]>([]);

  /**
   * Validates the required fields and saves the task via the service.
   * On success it navigates to the board after briefly showing the toast.
   * On error the input is kept.
   *
   * @returns {Promise<void>}
   */
  async save(): Promise<void> {
    if (this.taskService.saving() || !this.validate()) {
      return;
    }

    const saved = await this.taskService.addTask(this.buildTask());

    if (saved) {
      this.showSavedAndLeave();
    }
  }

  /**
   * Clears all fields and hides the error messages.
   *
   * @returns {void}
   */
  clear(): void {
    this.taskForm.resetForm();
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.priority.set('medium');
    this.assignedContacts.set([]);
    this.category.set(null);
    this.subtasks.set([]);
    this.subtaskComp.clearInput();
    this.fieldError.reset();
    this.taskService.errorMessage.set('');
  }

  /**
   * Silently checks whether all required fields are valid (for the create button).
   *
   * @returns {boolean} true if title, date and category are valid.
   */
  isFormValid(): boolean {
    return (
      this.fieldError.isFieldValid('title', this.title) &&
      this.fieldError.isFieldValid('dueDate', this.dueDate) &&
      this.fieldError.isFieldValid('category', this.category() ?? '')
    );
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
      priority: this.priority(),
      category: this.category(),
      worker_id: this.assignedContacts().map((contact) => contact.id),
      subtask: this.subtasks().map((item) => ({ title: item.title, completed: false })),
      status: 'todo',
      position: 0,
    };
  }

  /**
   * Clears the form, shows the toast and then navigates to the board.
   *
   * @returns {void}
   */
  private showSavedAndLeave(): void {
    this.clear();
    this.toast.show('Task added to board');
    window.setTimeout(() => void this.router.navigate(['/board']), 1500);
  }

  /**
   * Validates all required fields at once so that all errors become visible.
   *
   * @returns {boolean} true if all required fields are valid.
   */
  private validate(): boolean {
    const results = [
      this.fieldError.check('title', this.title),
      this.fieldError.check('dueDate', this.dueDate),
      this.fieldError.check('category', this.category() ?? ''),
    ];
    return results.every(Boolean);
  }
}
