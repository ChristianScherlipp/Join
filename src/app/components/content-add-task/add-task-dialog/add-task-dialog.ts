import { Component, ElementRef, ViewChild, inject, output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FieldError } from '../../../services/field-error';
import { TaskService } from '../../../services/task-service';
import { ButtonPriority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { DropDownCategory } from '../../elements/drop-down-category/drop-down-category';
import { ISubtask, Subtask } from '../../elements/subtask/subtask';
import { ToastSuccess } from '../../elements/toast-succsess/toast-succsess';
import { IUser } from '../../../interfaces/iuser';
import { TaskCategory, TaskPriority, TaskStatus } from '../../../interfaces/task';

@Component({
  imports: [ButtonPriority, DropDownAssignedto, ButtonPrimary, DropDownCategory, Subtask, FormsModule, ToastSuccess],
  providers: [FieldError],
  selector: 'app-add-task-dialog',
  styleUrl: './add-task-dialog.scss',
  templateUrl: './add-task-dialog.html',
})
export class AddTaskDialog {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  readonly fieldError = inject(FieldError);
  readonly taskService = inject(TaskService);

  // Meldet der Hauptkomponente, dass ein Task erstellt wurde.
  readonly created = output<void>();

  // Zugriff auf das Formular, um es zurückzusetzen.
  @ViewChild('taskForm')
  private taskForm!: NgForm;

  // Toast, der nach dem Speichern angezeigt wird.
  @ViewChild('toast')
  private toast!: ToastSuccess;

  // Subtask-Komponente, um ihr Eingabefeld beim Zurücksetzen zu leeren.
  @ViewChild(Subtask)
  private subtaskComp!: Subtask;

  title = '';
  description = '';
  dueDate = '';
  priority: TaskPriority | null = 'medium';
  assignedContacts: IUser[] = [];
  category: TaskCategory | null = null;
  subtasks: ISubtask[] = [];
  status: TaskStatus = 'todo';

  /**
   * Öffnet den Dialog für die Spalte, aus der er geöffnet wurde.
   */
  open(status: TaskStatus = 'todo'): void {
    this.status = status;
    this.dialog.nativeElement.showModal();
  }

  /**
   * Verhindert das Schließen per Klick außerhalb oder Esc, während gespeichert wird.
   */
  onCancel(event: Event): void {
    if (this.taskService.saving()) event.preventDefault();
  }

  /**
   * Schließt den Dialog, sofern gerade nicht gespeichert wird.
   * Das Formular wird über das (close)-Event geleert.
   */
  close(): void {
    if (this.taskService.saving()) return;
    this.dialog.nativeElement.close();
  }

  /**
   * Prüft still, ob alle Pflichtfelder gültig sind (für den Create-Button).
   */
  isFormValid(): boolean {
    return !!this.title.trim() && !!this.dueDate && !!this.category;
  }

  /**
   * Legt die neue Aufgabe in der Spalte an, aus der der Dialog geöffnet wurde.
   * Bei Erfolg wird der Dialog geschlossen und ein Toast angezeigt.
   */
  async createTask(): Promise<void> {
    if (this.taskService.saving() || !this.validate()) return;
    const saved = await this.taskService.addTask({
      title: this.title.trim(),
      description: this.description.trim() || null,
      date: this.dueDate,
      worker_id: this.assignedContacts.map((contact) => contact.id),
      subtask: this.subtasks.length
        ? this.subtasks.map(({ title }) => ({ title, completed: false }))
        : null,
      category: this.category,
      priority: this.priority,
      status: this.status,
      position: 0,
    });
    // Bei einem Fehler bleiben Dialog und Eingaben erhalten.
    if (saved) {
      this.close();
      this.toast.show('Task added to board');
      this.created.emit();
    }
  }

  // Prüft alle Pflichtfelder auf einmal, damit alle Fehler (auch Kategorie) rot angezeigt werden.
  private validate(): boolean {
    const results = [
      this.fieldError.check('title', this.title),
      this.fieldError.check('dueDate', this.dueDate),
      this.fieldError.check('category', this.category ?? ''),
    ];
    return results.every(Boolean);
  }

  // Leert das Formular und die Fehlermeldungen für die nächste Aufgabe.
  resetForm(): void {
    this.taskForm.resetForm();
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.priority = 'medium';
    this.assignedContacts = [];
    this.category = null;
    this.subtasks = [];
    this.subtaskComp.clearInput();
    this.status = 'todo';
    this.fieldError.reset();
    this.taskService.errorMessage.set('');
  }
}
