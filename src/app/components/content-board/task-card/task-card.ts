import { Component, computed, input, output } from '@angular/core';
import { InitialIcon } from '../../elements/initial-icon/initial-icon';
import { TaskWithContacts } from '../../../interfaces/task';

/**
 * A task card on the board with progress and assigned contacts.
 */
@Component({
  imports: [InitialIcon],
  selector: 'app-task-card',
  styleUrl: './task-card.scss',
  templateUrl: './task-card.html',
})
export class TaskCard {
  /** The task to display. */
  readonly task = input.required<TaskWithContacts>();

  /** The subtasks of the task, an empty list if there is no data. */
  readonly subtasks = computed(() => this.task().subtask ?? []);

  /** Number of all subtasks. */
  readonly subtasksTotal = computed(() => this.subtasks().length);

  /** Number of completed subtasks. */
  readonly subtasksDone = computed(() =>
    this.subtasks().filter(subtask => subtask.completed).length);

  /** The first three assigned contacts. */
  readonly visibleContacts = computed(() =>
    this.task().assignedContacts.slice(0, 3));

  /** true if more than three contacts are assigned. */
  readonly hasMoreContacts = computed(() =>
    this.task().assignedContacts.length > 3);

  /** Number of contacts that are not shown individually. */
  readonly hiddenContacts = computed(() =>
    this.task().assignedContacts.length - 3);

  /** Progress of the subtasks in percent. */
  readonly progress = computed(() =>
    this.subtasksTotal() === 0 ? 0 : (this.subtasksDone() / this.subtasksTotal()) * 100
  );

  /** Emitted when the card should be opened. */
  readonly opened = output<void>();
}
