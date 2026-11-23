import { Component, DOCUMENT, inject, signal, computed, viewChild } from '@angular/core';
import { ButtonPrimary } from '../elements/button-primary/button-primary';
import { TaskCard } from './task-card/task-card';
import { SearchInput } from '../elements/search-input/search-input';
import { ToastSuccess } from '../elements/toast-succsess/toast-succsess';
import { TaskService } from '../../services/task-service';
import { TaskPositionChange, TaskStatus, TaskWithContacts } from '../../interfaces/task';
import { TaskDialog } from '../content-tasks/task-dialog/task-dialog';
import { TaskEditDialog } from '../content-tasks/task-edit-dialog/task-edit-dialog';
import { AddTaskDialog } from '../content-add-task/add-task-dialog/add-task-dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragMove,
  CdkDragPreview,
  CdkDropList,
  CdkDropListGroup,
} from '@angular/cdk/drag-drop';

/**
 * Describes a column of the Kanban board.
 */
interface BoardColumn {
  id: TaskStatus;
  title: string;
  canAdd: boolean;
}

/**
 * The Kanban board with search, drag & drop and detail and edit dialogs.
 */
@Component({
  imports: [ButtonPrimary, TaskCard, SearchInput, TaskDialog, TaskEditDialog, AddTaskDialog, ToastSuccess, CdkDropListGroup, CdkDropList, CdkDrag, CdkDragPreview, CdkScrollable],
  selector: 'app-content-board',
  styleUrl: './content-board.scss',
  templateUrl: './content-board.html',
})
export class ContentBoard {
  private readonly taskService = inject(TaskService);
  private readonly document = inject(DOCUMENT);
  private readonly breakpoints = inject(BreakpointObserver);
  private readonly addTaskDialog = viewChild.required(AddTaskDialog);
  private readonly toast = viewChild(ToastSuccess);

  /** All tasks, grouped by column. */
  readonly tasksByStatus = this.taskService.tasksByStatus;

  /** ID of the task whose details are open. */
  readonly selectedTaskId = signal<number | null>(null);

  /** true while the edit dialog is open. */
  readonly editing = signal(false);

  /** The task of the open detail view. */
  readonly selectedTask = computed(() =>
    this.taskService.tasksWithContacts().find(
      task => task.id === this.selectedTaskId()
    ) ?? null
  );

  /** true if the board is narrower than 1100px. */
  readonly isNarrow = toSignal(
    this.breakpoints.observe('(max-width: 1100px)').pipe(map(state => state.matches)),
    { initialValue: false },
  );

  /** The four columns of the board. */
  readonly columns: BoardColumn[] = [
    { id: 'todo', title: 'To do', canAdd: true },
    { id: 'progress', title: 'In progress', canAdd: true },
    { id: 'await', title: 'Await feedback', canAdd: true },
    { id: 'done', title: 'Done', canAdd: false },
  ];

  /** true if the search has no results. */
  noResult = signal(false);

  /** The current search text. */
  readonly searchText = signal('');

  /** The tasks per column, filtered by the search text. */
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

  /** true if at least one task matches the search. */
  readonly hasMatch = computed(() => Object.values(this.visibleTasks()).some(list => list.length > 0));

  /**
   * Loads the board and shows a notice when a task was deleted.
   */
  constructor() {
    this.taskService.taskDeleted
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.toast()?.show('Task deleted successfully');
      });

    void this.taskService.loadBoard();
  }

  /**
   * Takes over the search text and checks whether there are results.
   *
   * @param {string} query - The entered search text.
   * @returns {void}
   */
  onSearch(query: string): void {
    this.searchText.set(query);
    this.updateNoResult();
  }

  /**
   * Resets the search so all tasks are visible again.
   *
   * @returns {void}
   */
  onSearchCleared(): void {
    this.searchText.set('');
  }

  /**
   * Opens the dialog for creating a task in a column.
   *
   * @param {TaskStatus} [status='todo'] - The column in which the task is created.
   * @returns {void}
   */
  openAddTask(status: TaskStatus = 'todo'): void {
    this.addTaskDialog().open(status);
  }

  /**
   * Opens the detail view of a task.
   *
   * @param {number} id - The ID of the task.
   * @returns {void}
   */
  openTask(id: number): void {
    this.taskService.errorMessage.set('');
    this.selectedTaskId.set(id);
    this.editing.set(false);
  }

  /**
   * Closes the detail view and the edit dialog.
   *
   * @returns {void}
   */
  closeTask(): void {
    this.selectedTaskId.set(null);
    this.editing.set(false);
  }

  /**
   * Places the card at the matching position of the full column (also during a search).
   *
   * @param {CdkDragDrop<TaskWithContacts[]>} event - The drop event.
   * @param {TaskStatus} status - The column the card was dropped into.
   * @returns {void}
   */
  onDrop(event: CdkDragDrop<TaskWithContacts[]>, status: TaskStatus): void {
    const sameColumn = event.previousContainer === event.container;
    if (sameColumn && event.previousIndex === event.currentIndex) return;

    this.taskService.updatePositions(this.buildPositionChanges(event, status));
  }

  /**
   * Tilts the dragged card in the drag direction (right 3deg, left -3deg).
   *
   * @param {CdkDragMove} event - The move event.
   * @returns {void}
   */
  onDragMoved(event: CdkDragMove): void {
    const x = event.distance.x;
    const tilt = x > 20 ? '3deg' : x < -20 ? '-3deg' : '0deg';
    this.setDragStyle('--drag-tilt', tilt);
  }

  /**
   * Straightens the card again after release.
   *
   * @returns {void}
   */
  onDragEnded(): void {
    this.setDragStyle('--drag-tilt', '0deg');
  }

  /**
   * Calculates column and position of all cards of the target column after a drop.
   *
   * @param {CdkDragDrop<TaskWithContacts[]>} event - The drop event.
   * @param {TaskStatus} status - The target column.
   * @returns {TaskPositionChange[]} The new positions of the target column.
   */
  private buildPositionChanges(
    event: CdkDragDrop<TaskWithContacts[]>,
    status: TaskStatus,
  ): TaskPositionChange[] {
    const movedTask = event.previousContainer.data[event.previousIndex];
    const visibleTarget = event.container.data.filter(task => task.id !== movedTask.id);
    const fullTarget = this.tasksByStatus()[status].filter(task => task.id !== movedTask.id);
    const insertAt = this.findInsertIndex(fullTarget, visibleTarget, event.currentIndex);
    fullTarget.splice(insertAt, 0, movedTask);
    return fullTarget.map((task, index) => ({ id: task.id, status, position: index + 1 }));
  }

  /**
   * Finds the position in the full list that matches the slot in the visible list.
   *
   * @param {TaskWithContacts[]} fullList - All tasks of the column.
   * @param {TaskWithContacts[]} visibleList - The visible tasks of the column.
   * @param {number} visibleIndex - The slot in the visible list.
   * @returns {number} The insertion position in the full list.
   */
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

  /**
   * Writes a CSS variable at the top of the document so the preview can read it.
   *
   * @param {string} name - The name of the CSS variable.
   * @param {string} value - The new value.
   * @returns {void}
   */
  private setDragStyle(name: string, value: string): void {
    this.document.documentElement.style.setProperty(name, value);
  }

  /**
   * Sets the "no results" state and shows a toast.
   *
   * @returns {void}
   */
  private updateNoResult(): void {
    this.noResult.set(!this.hasMatch());
    if (this.noResult()) {
      this.toast()?.show('no result found');
    }
  }

  /**
   * Filters tasks by the search text.
   *
   * @param {TaskWithContacts[]} tasks - The tasks to filter.
   * @param {string} query - The search text in lowercase.
   * @returns {TaskWithContacts[]} The matching tasks.
   */
  private filterTasks(tasks: TaskWithContacts[], query: string): TaskWithContacts[] {
    return tasks.filter(task => this.matchesQuery(task, query));
  }

  /**
   * Checks whether the title or description contains the search text.
   *
   * @param {TaskWithContacts} task - The task to check.
   * @param {string} query - The search text in lowercase.
   * @returns {boolean} true if the task matches.
   */
  private matchesQuery(task: TaskWithContacts, query: string): boolean {
    const title = (task.title ?? '').toLowerCase();
    const description = (task.description ?? '').toLowerCase();
    return title.includes(query) || description.includes(query);
  }
}
