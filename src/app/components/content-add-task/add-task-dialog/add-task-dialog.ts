import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldError } from '../../../services/field-error';
import { ButtonPriority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { DropDownCategory } from '../../elements/drop-down-category/drop-down-category';
import { Subtask } from '../../elements/subtask/subtask';

@Component({
  imports: [ButtonPriority, DropDownAssignedto, ButtonPrimary, DropDownCategory, Subtask, FormsModule],
  providers: [FieldError],
  selector: 'app-add-task-dialog',
  styleUrl: './add-task-dialog.scss',
  templateUrl: './add-task-dialog.html',
})
export class AddTaskDialog implements AfterViewInit {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  readonly fieldError = inject(FieldError);
  title = '';
  dueDate = '';

  // TEMPORÄR: öffnet den Dialog beim Laden der Seite, damit man ihn sehen kann
  ngAfterViewInit() {
    this.dialog.nativeElement.showModal();
  }

  open(): void {
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
  }
}
