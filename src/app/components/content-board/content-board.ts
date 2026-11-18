import { Component, inject, signal, computed, viewChild } from '@angular/core';
import { ButtonPrimary } from '../elements/button-primary/button-primary';
import { TaskCard } from './task-card/task-card';
import { SearchInput } from '../elements/search-input/search-input';
import { ToastSuccess } from '../elements/toast-succsess/toast-succsess';
import { TaskService } from '../../services/task-service';
import { TaskStatus, TaskWithContacts } from '../../interfaces/task';
import { TaskDialog } from '../content-tasks/task-dialog/task-dialog';
import { TaskEditDialog } from '../content-tasks/task-edit-dialog/task-edit-dialog';
import { AddTaskDialog } from '../content-add-task/add-task-dialog/add-task-dialog';

interface BoardColumn {
  id: TaskStatus;
  title: string;
  canAdd: boolean;
}

@Component({
  imports: [ButtonPrimary, TaskCard, SearchInput, TaskDialog, TaskEditDialog, AddTaskDialog, ToastSuccess],
  selector: 'app-content-board',
  styleUrl: './content-board.scss',
  templateUrl: './content-board.html',
})
export class ContentBoard {
  private readonly taskService = inject(TaskService);
  private readonly addTaskDialog = viewChild.required(AddTaskDialog);

  readonly tasksByStatus = this.taskService.tasksByStatus;

  readonly selectedTaskId = signal<number | null>(null);
  readonly editing = signal(false);

  readonly selectedTask = computed(() =>
    this.taskService.tasksWithContacts().find(
      task => task.id === this.selectedTaskId()
    ) ?? null
  );

  readonly columns: BoardColumn[] = [
    { id: 'todo', title: 'To do', canAdd: true },
    { id: 'progress', title: 'In progress', canAdd: true },
    { id: 'await', title: 'Await feedback', canAdd: true },
    { id: 'done', title: 'Done', canAdd: false },
  ];

  noResult = signal(false);
  readonly searchText = signal('');
  private readonly toast = viewChild(ToastSuccess);
  readonly visibleTasks = computed(() => {
    const tasks = this.tasksByStatus();
    const query = this.searchText().trim().toLowerCase();
    return {
      todo: this.filterTasks(tasks.todo, query),
      progress: this.filterTasks(tasks.progress, query),
      await: this.filterTasks(tasks.await, query),
      done: this.filterTasks(tasks.done, query),
    };
  });

  readonly hasMatch = computed(() => Object.values(this.visibleTasks()).some(list => list.length > 0));

  constructor() {
    this.taskService.loadBoard();
  }

  onSearch(query: string): void {
    this.searchText.set(query);
    this.updateNoResult();
  }

  onSearchCleared(): void {
    this.searchText.set('');
  }
  private updateNoResult(): void {
    this.noResult.set(!this.hasMatch());
    if (this.noResult()) {
      this.toast()?.show('no result found');
    }
  }

  openAddTask(status: TaskStatus = 'todo') {
    this.addTaskDialog().open(status);
  }

  openTask(id: number): void {
    this.taskService.errorMessage.set('');
    this.selectedTaskId.set(id);
    this.editing.set(false);
  }

  closeTask(): void {
    this.selectedTaskId.set(null);
    this.editing.set(false);
  }

  private filterTasks(tasks: TaskWithContacts[], query: string): TaskWithContacts[] {
    return tasks.filter(task => this.matchesQuery(task, query))
  }

  private matchesQuery(task: TaskWithContacts, query: string): boolean {
    const title = (task.title ?? '').toLowerCase();
    const description = (task.description ?? '').toLowerCase();
    return title.includes(query) || description.includes(query);
  }
}