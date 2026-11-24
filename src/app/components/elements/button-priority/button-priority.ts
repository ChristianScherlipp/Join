import { Component, model } from '@angular/core';

/** The selectable priorities. */
export type Priority = 'urgent' | 'medium' | 'low';

/**
 * Selection of the priority of a task.
 *
 * @example
 * <app-button-priority [(selected)]="priority" />
 */
@Component({
  imports: [],
  selector: 'app-button-priority',
  styleUrl: './button-priority.scss',
  templateUrl: './button-priority.html',
})
export class ButtonPriority {
  /** Currently selected priority, bindable from the parent via [(selected)]. */
  readonly selected = model<Priority | null>(null);

  readonly priorities: { key: Priority; label: string; icon: string }[] = [
    { key: 'urgent', label: 'Urgent', icon: './assets/icons/prio-urgent.svg' },
    { key: 'medium', label: 'Medium', icon: './assets/icons/prio-medium.svg' },
    { key: 'low', label: 'Low', icon: './assets/icons/prio-low.svg' },
  ];

  /**
   * Selects a priority.
   *
   * @param {Priority} priority - The selected priority.
   * @returns {void}
   */
  select(priority: Priority): void {
    this.selected.set(priority);
  }
}
