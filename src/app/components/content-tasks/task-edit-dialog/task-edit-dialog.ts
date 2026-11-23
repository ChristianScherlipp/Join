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

// Behält den Erledigt-Status vorhandener Subtasks im Formular.
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
  readonly task = input.required<TaskWithContacts>();

  readonly closed = output<void>();
  readonly saved = output<void>();

  readonly taskService = inject(TaskService);
  readonly contactService = inject(ContactService);

  readonly dialog =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  private readonly opener =
    document.activeElement as HTMLElement | null;

  private closeTimer?: ReturnType<typeof setTimeout>;

  // Steuert die CSS-Klasse für die Schließanimation.
  readonly isClosing = signal(false);

  // Eingabewerte des Formulars.
  title = '';
  description = '';
  date = '';

  category: TaskCategory | '' = '';
  priority: TaskPriority | null = null;
  status: TaskStatus | '' = '';

  selectedContacts: Pick<IUser, 'id' | 'name'>[] = [];

  readonly subtasks = signal<EditableSubtask[]>([]);

  validationMessage = '';
  submitted = false;

  /**
   * Übernimmt die vorhandenen Task-Daten in das Formular.
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

    // Ergänzt lokale IDs und erhält vorhandene Häkchen.
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
   * Räumt den Timer auf und gibt den Fokus zurück.
   */
  ngOnDestroy(): void {
    clearTimeout(this.closeTimer);
    this.opener?.focus();
  }

  /**
   * Spielt die Schließanimation ab und führt danach
   * die übergebene Aktion aus.
   */
  private closeWithAnimation(action: () => void): void {
    if (this.isClosing()) {
      return;
    }

    this.isClosing.set(true);

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    this.closeTimer = setTimeout(() => {
      action();
    }, reducedMotion ? 0 : 400);
  }

  /**
   * Meldet das Schließen nach Ablauf der Animation.
   */
  close(): void {
    if (this.taskService.saving()) {
      return;
    }

    this.closeWithAnimation(() => this.closed.emit());
  }

  /**
   * Erkennt Klicks außerhalb des Dialogfensters.
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
   * Prüft und speichert das Formular.
   * Nach erfolgreichem Speichern läuft die Schließanimation.
   */
  async save(form: NgForm): Promise<void> {
    if (this.taskService.saving() || this.isClosing()) {
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

        // Übernimmt die aktuelle Auswahl aus dem Dropdown.
        worker_id: this.selectedContacts.map(
          contact => contact.id
        ),

        // Speichert ohne lokale Formular-ID.
        // Neue Subtasks sind zunächst nicht erledigt.
        subtask: this.subtasks().map(subtask => ({
          title: subtask.title,
          completed: subtask.completed ?? false,
        })),
      }
    );

    if (success) {
      this.closeWithAnimation(() => this.saved.emit());
    }
  }
}