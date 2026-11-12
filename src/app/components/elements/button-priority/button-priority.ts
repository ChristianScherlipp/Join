import { Component, model } from '@angular/core';

export type Priority = 'urgent' | 'medium' | 'low';

@Component({
  imports: [],
  selector: 'app-button-priority',
  styleUrl: './button-priority.scss',
  templateUrl: './button-priority.html',
})
export class ButtonPriority {
  // Aktuell gewählte Priorität, per [(selected)] vom Parent bindbar.
  readonly selected = model<Priority | null>(null);

  readonly priorities: { key: Priority; label: string; icon: string }[] = [
    { key: 'urgent', label: 'Urgent', icon: './assets/icons/prio-urgent.svg' },
    { key: 'medium', label: 'Medium', icon: './assets/icons/prio-medium.svg' },
    { key: 'low', label: 'Low', icon: './assets/icons/prio-low.svg' },
  ];

  select(priority: Priority): void {
    this.selected.set(priority);
  }
}