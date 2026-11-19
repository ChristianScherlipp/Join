import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import {
  TaskCategory,
  TaskPriority,
  TaskStatus,
  TaskWithContacts,
} from '../../../interfaces/task';
import { IUser } from '../../../interfaces/iuser';

import { TaskService } from '../../../services/task-service';
import { ContactService } from '../../../services/contact-service';

import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonPriority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';
import { Subtask, ISubtask } from '../../elements/subtask/subtask';

// Ergänzt den Formular-Subtask um den vorhandenen Erledigt-Status.
// Neue Einträge aus der Subtask-Komponente haben diesen Wert noch nicht.
interface EditableSubtask extends ISubtask {
  completed?: boolean;
}

@Component({
  selector: 'app-task-edit-dialog',
  imports: [
    FormsModule,
    ButtonPrimary,
    ButtonPriority,
    DropDownAssignedto,
    Subtask,
  ],
  templateUrl: './task-edit-dialog.html',
  styleUrl: './task-edit-dialog.scss',
})
export class TaskEditDialog implements OnInit, AfterViewInit, OnDestroy {
  // Der Task, der bearbeitet werden soll.
  readonly task = input.required<TaskWithContacts>();

  // Meldungen an die übergeordnete Komponente.
  readonly closed = output<void>();
  readonly saved = output<void>();

  readonly taskService = inject(TaskService);
  readonly contactService = inject(ContactService);

  // Zugriff auf das Dialogfenster im HTML.
  readonly dialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  // Merkt sich das Element, das vor dem Öffnen fokussiert war.
  private readonly opener =
    document.activeElement as HTMLElement | null;

  // Werte der Eingabefelder.
  title = '';
  description = '';
  date = '';

  category: TaskCategory | '' = '';
  priority: TaskPriority | null = null;
  status: TaskStatus | '' = '';

  // Auswahl für das Assigned-to-Dropdown.
  selectedContacts: Pick<IUser, 'id' | 'name'>[] = [];

  // Formular-Subtasks mit lokaler ID und optionalem Erledigt-Status.
  readonly subtasks = signal<EditableSubtask[]>([]);

  validationMessage = '';
  submitted = false;

  /**
   * Übernimmt die vorhandenen Task-Daten in das Formular.
   * Die Subtasks werden kopiert, damit Änderungen zunächst
   * nur das Formular betreffen.
   */
  ngOnInit(): void {
    const task = this.task();

    this.title = task.title ?? '';
    this.description = task.description ?? '';
    this.date = task.date ?? '';

    this.category = task.category ?? '';
    this.priority = task.priority;
    this.status = task.status ?? '';

    // Übernimmt die bereits zugewiesenen Kontakte.
    this.selectedContacts = (task.worker_id ?? []).map(id => {
      const contact = task.assignedContacts.find(
        contact => contact.id === id
      );

      return {
        id: id,
        name: contact?.name ?? `Kontakt #${id}`,
      };
    });

    // Die ID wird nur innerhalb des Formulars benötigt.
    // Der Erledigt-Status aus der Datenbank bleibt erhalten.
    this.subtasks.set(
      (task.subtask ?? []).map((subtask, index) => ({
        id: index + 1,
        title: subtask.title,
        completed: subtask.completed,
      }))
    );

    this.taskService.errorMessage.set('');

    void this.contactService.getUsers();
  }

  /**
   * Öffnet den Dialog, sobald das HTML bereitsteht.
   */
  ngAfterViewInit(): void {
    this.dialog().nativeElement.showModal();
  }

  /**
   * Gibt den Fokus beim Entfernen der Komponente zurück.
   */
  ngOnDestroy(): void {
    this.opener?.focus();
  }

  /**
   * Meldet den Schließwunsch.
   * Während des Speicherns bleibt der Dialog geöffnet.
   */
  close(): void {
    if (!this.taskService.saving()) {
      this.closed.emit();
    }
  }

  /**
   * Schließt den Dialog bei einem Klick außerhalb des Fensters.
   */
  closeOnOutsideClick(event: MouseEvent): void {
    const dialog = event.currentTarget as HTMLDialogElement;
    const bounds = dialog.getBoundingClientRect();

    const isOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (event.target === dialog && isOutside) {
      this.close();
    }
  }

  /**
   * Prüft die Eingaben und speichert den bearbeiteten Task.
   */
  async save(form: NgForm): Promise<void> {
    if (this.taskService.saving()) {
      return;
    }

    this.submitted = true;
    this.validationMessage = '';

    if (
      form.invalid ||
      !this.title.trim() ||
      !this.date ||
      !this.category ||
      !this.priority ||
      !this.status
    ) {
      form.control.markAllAsTouched();

      this.validationMessage =
        'Bitte alle Pflichtfelder ausfüllen.';

      return;
    }

    const success = await this.taskService.updateTask(
      this.task().id,
      {
        title: this.title.trim(),
        description: this.description,
        date: this.date,
        category: this.category,
        priority: this.priority,
        status: this.status,

        // Speichert die aktuelle Auswahl aus dem Dropdown.
        worker_id: this.selectedContacts.map(
          contact => contact.id
        ),

        // Speichert nur das Datenbankformat, ohne lokale Formular-ID.
        // Neue Subtasks sind standardmäßig nicht erledigt.
        subtask: this.subtasks().map(subtask => ({
          title: subtask.title,
          completed: subtask.completed ?? false,
        })),
      }
    );

    if (success) {
      this.saved.emit();
    }
  }
}