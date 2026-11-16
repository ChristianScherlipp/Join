import { Component, ElementRef, Injector, afterNextRender, inject, model, signal, viewChild } from '@angular/core';
import { ButtonEditDelete } from '../button-edit-delete/button-edit-delete';

export interface ISubtask {
  id: number;
  title: string;
}

@Component({
  imports: [ButtonEditDelete],
  selector: 'app-subtask',
  styleUrl: './subtask.scss',
  templateUrl: './subtask.html',
})
export class Subtask {
  private readonly injector = inject(Injector);
  private readonly editField = viewChild<ElementRef<HTMLInputElement>>('editField');

  // Gespeicherte Subtasks, per [(subtasks)] vom Parent bindbar.
  readonly subtasks = model<ISubtask[]>([]);

  readonly inputText = signal('');
  readonly isInputActive = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly editText = signal('');

  onInput(event: Event): void {
    this.inputText.set((event.target as HTMLInputElement).value);
  }

  activateInput(): void {
    this.isInputActive.set(true);
  }

  deactivateInput(): void {
    this.isInputActive.set(false);
  }

  clearInput(): void {
    this.inputText.set('');
  }

  // Speichert den Text aus dem Eingabefeld als neuen Subtask.
  addSubtask(): void {
    const title = this.inputText().trim();
    if (!title) {
      return;
    }
    this.subtasks.update((list) => [...list, { id: this.createId(), title }]);
    this.clearInput();
  }

  deleteSubtask(id: number): void {
    this.subtasks.update((list) => list.filter((item) => item.id !== id));
    if (this.editingId() === id) {
      this.editingId.set(null);
    }
  }

  isEditing(item: ISubtask): boolean {
    return this.editingId() === item.id;
  }

  startEdit(item: ISubtask): void {
    this.editingId.set(item.id);
    this.editText.set(item.title);
    afterNextRender(() => this.editField()?.nativeElement.focus(), { injector: this.injector });
  }

  onEditInput(event: Event): void {
    this.editText.set((event.target as HTMLInputElement).value);
  }

  // Übernimmt den geänderten Text in die Zeile und beendet das Bearbeiten.
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

  private createId(): number {
    return Math.max(0, ...this.subtasks().map((item) => item.id)) + 1;
  }
}