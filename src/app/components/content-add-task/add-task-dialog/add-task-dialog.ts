import { Component, ElementRef, ViewChild, inject, output, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FieldError } from '../../../services/field-error';
import { TaskService } from '../../../services/task-service';
import { IUser } from '../../../interfaces/iuser';
import { ButtonPriority, Priority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { Category, DropDownCategory } from '../../elements/drop-down-category/drop-down-category';
import { ISubtask, Subtask } from '../../elements/subtask/subtask';
import { ToastSuccess } from '../../elements/toast-succsess/toast-succsess';
import { DropDownCategory } from '../../elements/drop-down-category/drop-down-category';
import { Subtask } from '../../elements/subtask/subtask';
import { TaskStatus } from '../../../interfaces/task';                    

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
   * Setzt das Formular zurück und öffnet den Dialog.
   */
  open(): void {
    this.clear();
  status: TaskStatus = 'todo';                                            
  open(status: TaskStatus = 'todo'): void {                               
    this.status = status;                                                
    console.log('Dialog geöffnet für:', this.status);                     
    this.dialog.nativeElement.showModal();
  }

  /**
   * Schließt den Dialog, sofern gerade nicht gespeichert wird.
   */
  close(): void {
    if (!this.taskService.saving()) {
      this.dialog.nativeElement.close();
    }
  }

  /**
   * Prüft die Pflichtfelder und speichert den Task über den Service.
   * Bei Erfolg wird der Dialog geschlossen.
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
    });

    // Bei einem Fehler bleiben Dialog und Eingaben erhalten.
    if (saved) {
      this.close();
      this.clear();
      this.toast.show('Task added to board');
      this.created.emit();
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
