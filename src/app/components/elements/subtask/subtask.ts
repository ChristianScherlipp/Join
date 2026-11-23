import { Component, ElementRef, Injector, afterNextRender, inject, model, signal, viewChild } from '@angular/core';
import { ButtonEditDelete } from '../button-edit-delete/button-edit-delete';

/**
 * A subtask in the form with a local ID.
 */
export interface ISubtask {
  id: number;
  title: string;
}

/**
 * Input field with a list for creating, editing and deleting subtasks.
 *
 * @example
 * <app-subtask [(subtasks)]="subtasks" />
 */
@Component({
  imports: [ButtonEditDelete],
  selector: 'app-subtask',
  styleUrl: './subtask.scss',
  templateUrl: './subtask.html',
})
export class Subtask {
  private readonly injector = inject(Injector);
  private readonly editField = viewChild<ElementRef<HTMLInputElement>>('editField');

  /** Saved subtasks, bindable from the parent via [(subtasks)]. */
  readonly subtasks = model<ISubtask[]>([]);

  readonly inputText = signal('');
  readonly isInputActive = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly editText = signal('');

  /**
   * Takes over the text of the input field.
   *
   * @param {Event} event - The input event.
   * @returns {void}
   */
  onInput(event: Event): void {
    this.inputText.set((event.target as HTMLInputElement).value);
  }

  /**
   * Shows the buttons next to the input field.
   *
   * @returns {void}
   */
  activateInput(): void {
    this.isInputActive.set(true);
  }

  /**
   * Hides the buttons next to the input field.
   *
   * @returns {void}
   */
  deactivateInput(): void {
    this.isInputActive.set(false);
  }

  /**
   * Clears the input field.
   *
   * @returns {void}
   */
  clearInput(): void {
    this.inputText.set('');
  }

  /**
   * Saves the text of the input field as a new subtask.
   * An empty text is ignored.
   *
   * @returns {void}
   */
  addSubtask(): void {
    const title = this.inputText().trim();
    if (!title) {
      return;
    }
    this.subtasks.update((list) => [...list, { id: this.createId(), title }]);
    this.clearInput();
  }

  /**
   * Deletes a subtask and ends its editing.
   *
   * @param {number} id - The ID of the subtask.
   * @returns {void}
   */
  deleteSubtask(id: number): void {
    this.subtasks.update((list) => list.filter((item) => item.id !== id));
    if (this.editingId() === id) {
      this.editingId.set(null);
    }
  }

  /**
   * Checks whether a subtask is currently being edited.
   *
   * @param {ISubtask} item - The subtask.
   * @returns {boolean} true if the subtask is being edited.
   */
  isEditing(item: ISubtask): boolean {
    return this.editingId() === item.id;
  }

  /**
   * Starts editing a subtask and puts the focus into the field.
   *
   * @param {ISubtask} item - The subtask.
   * @returns {void}
   */
  startEdit(item: ISubtask): void {
    this.editingId.set(item.id);
    this.editText.set(item.title);
    afterNextRender(() => this.editField()?.nativeElement.focus(), { injector: this.injector });
  }

  /**
   * Takes over the text of the edit field.
   *
   * @param {Event} event - The input event.
   * @returns {void}
   */
  onEditInput(event: Event): void {
    this.editText.set((event.target as HTMLInputElement).value);
  }

  /**
   * Takes over the changed text into the row and ends editing.
   * An empty text is ignored.
   *
   * @returns {void}
   */
  saveEdit(): void {
    const title = this.editText().trim();
    if (!title) {
      return;
    }
    this.subtasks.update((list) =>
      list.map((item) => (item.id === this.editingId() ? { ...item, title } : item)),
    );
    this.editingId.set(null);
  }

  /**
   * Creates the next free local ID.
   *
   * @returns {number} The highest existing ID plus 1.
   */
  private createId(): number {
    return Math.max(0, ...this.subtasks().map((item) => item.id)) + 1;
  }
}
