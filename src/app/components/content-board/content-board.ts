import { Component, inject, signal } from '@angular/core';
import { ButtonPrimary } from '../elements/button-primary/button-primary';
import { TaskCard } from './task-card/task-card';
import { SearchInput } from '../elements/search-input/search-input';
import { TaskService } from '../../services/task-service';
import { TaskStatus } from '../../interfaces/task';

interface BoardColumn {
  id: TaskStatus;
  title: string;
  canAdd: boolean;
}

@Component({
  imports: [ButtonPrimary, TaskCard, SearchInput],
  selector: 'app-content-board',
  styleUrl: './content-board.scss',
  templateUrl: './content-board.html',
})
export class ContentBoard {
  private readonly taskService = inject(TaskService);

  readonly tasksByStatus = this.taskService.tasksByStatus;

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
}