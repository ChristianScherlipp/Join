import { Component, computed, input } from '@angular/core';
import { InitialIcon } from '../../elements/initial-icon/initial-icon';
import { TaskWithContacts } from '../../../interfaces/task';

@Component({
  imports: [InitialIcon],
  selector: 'app-task-card',
  styleUrl: './task-card.scss',
  templateUrl: './task-card.html',
})
export class TaskCard {
  readonly task = input.required<TaskWithContacts>();

  readonly subtasks = computed(() => this.task().subtask ?? []);

  readonly subtasksTotal = computed(() => this.subtasks().length);

  readonly subtasksDone = computed(() =>
    this.subtasks().filter(subtask => subtask.completed).length);

  readonly visibleContacts = computed(() =>
    this.task().assignedContacts.slice(0, 3));

  readonly hasMoreContacts = computed(() =>
    this.task().assignedContacts.length > 3);

  readonly hiddenContacts = computed(() =>
    this.task().assignedContacts.length - 3);

  readonly progress = computed(() =>
    this.subtasksTotal() === 0 ? 0 : (this.subtasksDone() / this.subtasksTotal()) * 100
  );
}