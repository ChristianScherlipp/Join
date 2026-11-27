import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, formatDate } from '@angular/common';
import { TaskService } from '../../services/task-service';
import { TaskPriority } from '../../interfaces/task';
import { Supabase } from '../../services/supabase';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-content-summary',
  styleUrl: './content-summary.scss',
  templateUrl: './content-summary.html',
})
export class ContentSummary {
  private readonly taskService = inject(TaskService);
  readonly supabase = inject(Supabase);
  readonly showIntro = this.supabase.showIntro();

  private readonly today = formatDate(new Date(), 'yyyy-MM-dd', 'en');
  private readonly priorities: TaskPriority[] = ['low', 'medium', 'urgent'];

  readonly todoCount = computed(() => this.taskService.tasksByStatus().todo.length);
  readonly progressCount = computed(() => this.taskService.tasksByStatus().progress.length);
  readonly awaitCount = computed(() => this.taskService.tasksByStatus().await.length);
  readonly doneCount = computed(() => this.taskService.tasksByStatus().done.length);
  readonly totalCount = computed(() => this.taskService.tasksWithContacts().length);
  

  readonly openDates = computed(() =>
    this.taskService.tasksWithContacts()
      .filter(task => task.status !== 'done' && task.date)
      .map(task => task.date)
      .sort()
  );

  readonly nextDeadline = computed(() => this.openDates()[0] ?? null);

  readonly isOverdue = computed(() => {
    const deadline = this.nextDeadline();
    return deadline !== null && deadline < this.today;
  });

  readonly deadlineTasks = computed(() => {
    const deadline = this.nextDeadline();
    if (deadline === null) return [];

    return this.taskService.tasksWithContacts()
      .filter(task => task.status !== 'done' && task.date === deadline);
  });

  readonly deadlinePriorities = computed(() =>
    this.priorities
      .map(priority => ({
        priority: priority,
        count: this.deadlineTasks().filter(task => task.priority === priority).length
      }))
      .filter(item => item.count > 0)
  );

  readonly hasManyPriorities = computed(() => this.deadlinePriorities().length > 1);

  readonly greeting = this.getGreeting();

  readonly isGuest = computed(() => this.supabase.userName() === 'Guest');

  constructor() {
    this.taskService.loadBoard();
    this.supabase.showIntro.set(false); 
  }

  private getGreeting(): string {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
}