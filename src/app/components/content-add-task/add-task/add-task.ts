import { Component, inject, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonPriority, Priority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';
import { Category, DropDownCategory } from '../../elements/drop-down-category/drop-down-category';
import { ISubtask, Subtask } from '../../elements/subtask/subtask';
import { FieldError } from '../../../services/field-error';
import { TaskService } from '../../../services/task-service';
import { IUser } from '../../../interfaces/iuser';
import { ToastSuccess } from '../../elements/toast-succsess/toast-succsess';

@Component({
  imports: [ButtonPrimary, ButtonPriority, DropDownAssignedto, DropDownCategory, Subtask, FormsModule, ToastSuccess],
  providers: [FieldError],
  selector: 'app-add-task',
  styleUrl: './add-task.scss',
  templateUrl: './add-task.html',
})
export class AddTask {
  readonly fieldError = inject(FieldError);
  readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  // Zugriff auf das Formular, um es zurückzusetzen.
  @ViewChild('taskForm')
  private taskForm!: NgForm;

  // Toast, der nach dem Speichern angezeigt wird.
  @ViewChild('toast')
  private toast!: ToastSuccess;

  // Subtask-Komponente, um ihr Eingabefeld beim Zurücksetzen zu leeren.
  @ViewChild(Subtask)
  private subtaskComp!: Subtask;

  // Eingaben aus den normalen Feldern (per ngModel).
  title = '';
  description = '';
  dueDate = '';

  // Werte aus den Kind-Komponenten (per [(...)] gebunden).
  readonly priority = signal<Priority | null>('medium');
  readonly assignedContacts = signal<Pick<IUser, 'id' | 'name'>[]>([]);
  readonly category = signal<Category | null>(null);
  readonly subtasks = signal<ISubtask[]>([]);

  /**
   * Prüft die Pflichtfelder und speichert den Task über den Service.
   * Bei Erfolg geht es zum Board.
   */
  async save(): Promise<void> {
    if (this.taskService.saving() || !this.validate()) {
      return;
    }

    const saved = await this.taskService.addTask({
      title: this.title.trim(),
      description: this.description.trim() || null,
      date: this.dueDate,
      priority: this.priority(),
      category: this.category(),
      worker_id: this.assignedContacts().map((contact) => contact.id),
      subtask: this.subtasks().map((item) => ({ title: item.title, completed: false })),
      status: 'todo',
      position: 0
    });

    // Bei einem Fehler bleiben die Eingaben erhalten.
    // Erst den Toast zeigen, dann zum Board wechseln.
    if (saved) {
      this.clear();
      this.toast.show('Task added to board');
      window.setTimeout(() => void this.router.navigate(['/board']), 1500);
    }
  }

  /**
   * Leert alle Felder und blendet die Fehlermeldungen aus.
   */
  clear(): void {
    this.taskForm.resetForm();
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.priority.set('medium');
    this.assignedContacts.set([]);
    this.category.set(null);
    this.subtasks.set([]);
    this.subtaskComp.clearInput();
    this.fieldError.reset();
    this.taskService.errorMessage.set('');
  }

  /**
   * Prüft still, ob alle Pflichtfelder gültig sind (für den Create-Button).
   */
  isFormValid(): boolean {
    return (
      this.fieldError.isFieldValid('title', this.title) &&
      this.fieldError.isFieldValid('dueDate', this.dueDate) &&
      this.fieldError.isFieldValid('category', this.category() ?? '')
    );
  }

  // Prüft alle Pflichtfelder auf einmal, damit alle Fehler sichtbar werden.
  private validate(): boolean {
    const results = [
      this.fieldError.check('title', this.title),
      this.fieldError.check('dueDate', this.dueDate),
      this.fieldError.check('category', this.category() ?? ''),
    ];
    return results.every(Boolean);
  }
}
