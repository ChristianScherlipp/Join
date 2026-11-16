import { Component, signal } from '@angular/core';
import { ButtonPrimary } from '../elements/button-primary/button-primary';
import { TaskCard } from './task-card/task-card';
import { SearchInput } from '../elements/search-input/search-input';

@Component({
  imports: [ButtonPrimary, TaskCard, SearchInput],
  selector: 'app-content-board',
  styleUrl: './content-board.scss',
  templateUrl: './content-board.html',
})
export class ContentBoard {
  readonly columns = [
    { id: 'todo', title: 'To do', canAdd: true },
    { id: 'inProgress', title: 'In progress', canAdd: true },
    { id: 'awaitFeedback', title: 'Await feedback', canAdd: true },
    { id: 'done', title: 'Done', canAdd: false },
  ];

  noResult = signal(false);
}
