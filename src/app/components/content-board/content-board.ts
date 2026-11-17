import { Component, inject, signal, computed, viewChild } from '@angular/core';
import { ButtonPrimary } from '../elements/button-primary/button-primary';
import { TaskCard } from './task-card/task-card';
import { SearchInput } from '../elements/search-input/search-input';
import { TaskService } from '../../services/task-service';
import { TaskStatus } from '../../interfaces/task';
import { TaskDialog } from '../content-tasks/task-dialog/task-dialog';
import { TaskEditDialog } from '../content-tasks/task-edit-dialog/task-edit-dialog';
import { AddTaskDialog } from '../content-add-task/add-task-dialog/add-task-dialog';

interface BoardColumn {
  id: TaskStatus;
  title: string;
  canAdd: boolean;
}

@Component({
  imports: [ButtonPrimary, TaskCard, SearchInput, TaskDialog, TaskEditDialog, AddTaskDialog],
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
  

  constructor() {
    this.taskService.loadBoard();
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
}