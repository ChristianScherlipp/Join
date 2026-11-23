import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { TaskWithContacts } from '../../../interfaces/task';
import { TaskService } from '../../../services/task-service';

import { ButtonEditDelete } from '../../elements/button-edit-delete/button-edit-delete';
import { InitialIcon } from '../../elements/initial-icon/initial-icon';

/**
 * Detail view of a task with edit, delete and checkable subtasks.
 */
@Component({
  selector: 'app-task-dialog',
  imports: [DatePipe, ButtonEditDelete, InitialIcon],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss',
})
export class TaskDialog implements AfterViewInit, OnDestroy {
  readonly task = input.required<TaskWithContacts>();
  readonly closed = output<void>();
  readonly edit = output<void>();
  readonly deleted = output<void>();

  readonly taskService: TaskService = inject(TaskService);

  /** Controls the CSS class for the closing animation. */
  readonly isClosing = signal(false);

  readonly dialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  private readonly opener =
    document.activeElement as HTMLElement | null;

  private closeTimer?: ReturnType<typeof setTimeout>;

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
   * Closes the dialog via X, Escape or the backdrop.
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
   * Toggles the completed status of a subtask.
   *
   * @param {number} index - The position of the subtask in the list.
   * @returns {Promise<void>}
   */
  async toggleSubtask(index: number): Promise<void> {
    if (this.taskService.saving() || this.isClosing()) {
      return;
    }

    const task = this.task();
    const subtasks = (task.subtask ?? []).map((subtask, currentIndex) => ({
      ...subtask,
      completed: currentIndex === index ? !subtask.completed : subtask.completed,
    }));

    await this.taskService.updateTask(task.id, { subtask: subtasks });
  }

  /**
   * Closes the detail view with an animation and then reports the switch to the edit dialog.
   *
   * @returns {void}
   */
  openEdit(): void {
    if (this.taskService.saving()) {
      return;
    }

    this.closeWithAnimation(() => this.edit.emit());
  }

  /**
   * Deletes the task and then reports the deletion with a closing animation.
   *
   * @returns {Promise<void>}
   */
  async deleteTask(): Promise<void> {
    if (this.taskService.saving() || this.isClosing()) {
      return;
    }

    const success = await this.taskService.deleteTask(this.task().id);

    if (success) {
      this.closeWithAnimation(() => this.deleted.emit());
    }
  }

  /**
   * Starts the closing animation and then runs the given action.
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
