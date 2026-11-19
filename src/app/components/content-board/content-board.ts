import { Component, DOCUMENT, inject, signal, computed, viewChild } from '@angular/core';
import { ButtonPrimary } from '../elements/button-primary/button-primary';
import { TaskCard } from './task-card/task-card';
import { SearchInput } from '../elements/search-input/search-input';
import { ToastSuccess } from '../elements/toast-succsess/toast-succsess';
import { TaskService } from '../../services/task-service';
import { TaskStatus, TaskWithContacts } from '../../interfaces/task';
import { TaskDialog } from '../content-tasks/task-dialog/task-dialog';
import { TaskEditDialog } from '../content-tasks/task-edit-dialog/task-edit-dialog';
import { AddTaskDialog } from '../content-add-task/add-task-dialog/add-task-dialog';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragMove,
  CdkDragPreview,
  CdkDragStart,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';

interface BoardColumn {
  id: TaskStatus;
  title: string;
  canAdd: boolean;
}

@Component({
  imports: [ButtonPrimary, TaskCard, SearchInput, TaskDialog, TaskEditDialog, AddTaskDialog, ToastSuccess, CdkDropListGroup, CdkDropList, CdkDrag, CdkDragPreview],
  selector: 'app-content-board',
  styleUrl: './content-board.scss',
  templateUrl: './content-board.html',
})
export class ContentBoard {
  private readonly taskService = inject(TaskService);
  private readonly addTaskDialog = viewChild.required(AddTaskDialog);
  private readonly toast = viewChild(ToastSuccess);
  private readonly document = inject(DOCUMENT);

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

  // Setzt die Karte an die passende Stelle der vollen Spalte (auch während der Suche).
  onDrop(event: CdkDragDrop<TaskWithContacts[]>, status: TaskStatus): void {
    const sameColumn = event.previousContainer === event.container;
    if (sameColumn && event.previousIndex === event.currentIndex) return;

    const movedTask = event.previousContainer.data[event.previousIndex];
    const visibleTarget = event.container.data.filter(task => task.id !== movedTask.id);
    const fullTarget = this.tasksByStatus()[status].filter(task => task.id !== movedTask.id);

    const insertAt = this.findInsertIndex(fullTarget, visibleTarget, event.currentIndex);
    fullTarget.splice(insertAt, 0, movedTask);

    const changes = fullTarget.map((task, index) => ({
      id: task.id,
      status,
      position: index + 1,
    }));
    this.taskService.updatePositions(changes);
  }

  // Findet in der vollen Liste die Stelle, die zum Platz in der sichtbaren Liste passt.
  private findInsertIndex(
    fullList: TaskWithContacts[],
    visibleList: TaskWithContacts[],
    visibleIndex: number,
  ): number {
    const nextVisible = visibleList[visibleIndex];
    if (nextVisible) return fullList.findIndex(task => task.id === nextVisible.id);

    const lastVisible = visibleList[visibleList.length - 1];
    if (lastVisible) return fullList.findIndex(task => task.id === lastVisible.id) + 1;

    return 0;
  }

  onDragStarted(event: CdkDragStart): void {
    const card = event.source.element.nativeElement.getBoundingClientRect();
    const pointer = 'touches' in event.event ? event.event.touches[0] : event.event;
    const x = pointer.clientX - card.left;
    const y = pointer.clientY - card.top;
    this.setDragStyle('--drag-origin', `${x}px ${y}px`);
    this.setDragStyle('--drag-tilt', '0deg');
  }

  // Neigt die Karte sanft, je nachdem ob sie links oder rechts vom Startpunkt ist.
  onDragMoved(event: CdkDragMove): void {
    const x = event.distance.x;
    const tilt = x > 20 ? '3deg' : x < -20 ? '-3deg' : '0deg';
    this.setDragStyle('--drag-tilt', tilt);
  }

  // Nach dem Loslassen wieder gerade.
  onDragEnded(): void {
    this.setDragStyle('--drag-tilt', '0deg');
  }

  // Schreibt eine CSS-Variable ganz oben ins Dokument, damit die Vorschau sie lesen kann.
  private setDragStyle(name: string, value: string): void {
    this.document.documentElement.style.setProperty(name, value);
  }

  private updateNoResult(): void {
    this.noResult.set(!this.hasMatch());
    if (this.noResult()) {
      this.toast()?.show('no result found');
    }
  }

  private filterTasks(tasks: TaskWithContacts[], query: string): TaskWithContacts[] {
    return tasks.filter(task => this.matchesQuery(task, query));
  }

  private matchesQuery(task: TaskWithContacts, query: string): boolean {
    const title = (task.title ?? '').toLowerCase();
    const description = (task.description ?? '').toLowerCase();
    return title.includes(query) || description.includes(query);
  }
}