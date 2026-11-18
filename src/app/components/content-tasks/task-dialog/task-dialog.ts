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
import { Task, TaskWithContacts } from '../../../interfaces/task';
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

  readonly taskService = inject(TaskService);
  readonly confirmingDelete = signal(false);


  readonly dialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  private readonly opener = document.activeElement as HTMLElement | null;

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

  contactName(id: number): string {
    return this.task().assignedContacts.find(contact => contact.id === id)?.name
      ?? `Kontakt #${id}`;
  }

  async toggleSubtask(index: number): Promise<void> {
    if (this.taskService.saving()) return;

    const subtasks = (this.task().subtask ?? []).map((subtask, currentIndex) => ({
      ...subtask,
      completed:
        currentIndex === index ? !subtask.completed : subtask.completed,
    }));

    await this.taskService.updateTask(this.task().id, {
      subtask: subtasks,
    });
  }

  async deleteTask(): Promise<void> {
    if (await this.taskService.deleteTask(this.task().id)) {
      this.deleted.emit();
    }
  }


}