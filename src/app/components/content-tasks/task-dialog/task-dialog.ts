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

  // Steuert die CSS-Klasse für die Schließanimation.
  readonly isClosing = signal(false);

  readonly dialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  private readonly opener =
    document.activeElement as HTMLElement | null;

  private closeTimer?: ReturnType<typeof setTimeout>;

  /**
   * Öffnet den Dialog, sobald das HTML bereitsteht.
   */
  ngAfterViewInit(): void {
    this.dialog().nativeElement.showModal();
  }

  /**
   * Räumt den Timer auf und gibt den Fokus zurück.
   */
  ngOnDestroy(): void {
    clearTimeout(this.closeTimer);
    this.opener?.focus();
  }

  /**
   * Startet die Schließanimation.
   * Erst danach wird die übergebene Aktion ausgeführt.
   */
  private closeWithAnimation(action: () => void): void {
    if (this.isClosing()) {
      return;
    }

    this.isClosing.set(true);

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    this.closeTimer = setTimeout(() => {
      action();
    }, reducedMotion ? 0 : 400);
  }

  /**
   * Schließt den Dialog über X, Escape oder den Hintergrund.
   */
  close(): void {
    if (this.taskService.saving()) {
      return;
    }

    this.closeWithAnimation(() => this.closed.emit());
  }

  /**
   * Erkennt Klicks außerhalb des Dialogfensters.
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
   * Liefert den Namen eines zugewiesenen Kontakts.
   */
  contactName(id: number): string {
    const contact = this.task().assignedContacts.find(
      contact => contact.id === id
    );

    return contact?.name ?? `Kontakt #${id}`;
  }

  /**
   * Schaltet den Erledigt-Status eines Subtasks um.
   */
  async toggleSubtask(index: number): Promise<void> {
    if (this.taskService.saving() || this.isClosing()) {
      return;
    }

    const task = this.task();

    const subtasks = (task.subtask ?? []).map(
      (subtask, currentIndex) => ({
        ...subtask,
        completed:
          currentIndex === index
            ? !subtask.completed
            : subtask.completed,
      })
    );

    await this.taskService.updateTask(task.id, {
      subtask: subtasks,
    });
  }

  /**
   * Schließt die Detailansicht mit Animation
   * und meldet danach den Wechsel zum Edit-Dialog.
   */
  openEdit(): void {
    if (this.taskService.saving()) {
      return;
    }

    this.closeWithAnimation(() => this.edit.emit());
  }

  /**
   * Löscht den Task und meldet danach das Löschen
   * mit einer Schließanimation.
   */
  async deleteTask(): Promise<void> {
    if (this.taskService.saving() || this.isClosing()) {
      return;
    }

    const success = await this.taskService.deleteTask(
      this.task().id
    );

    if (success) {
      this.closeWithAnimation(() => this.deleted.emit());
    }
  }
}