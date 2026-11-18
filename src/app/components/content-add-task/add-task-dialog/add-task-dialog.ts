import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FieldError } from '../../../services/field-error';
import { ButtonPriority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { DropDownCategory } from '../../elements/drop-down-category/drop-down-category';
import { Subtask } from '../../elements/subtask/subtask';
import { TaskStatus } from '../../../interfaces/task';                    

@Component({
  imports: [ButtonPriority, DropDownAssignedto, ButtonPrimary, DropDownCategory, Subtask, FormsModule],
  providers: [FieldError],
  selector: 'app-add-task-dialog',
  styleUrl: './add-task-dialog.scss',
  templateUrl: './add-task-dialog.html',
})
export class AddTaskDialog {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  readonly fieldError = inject(FieldError);
  title = '';
  dueDate = '';
  status: TaskStatus = 'todo';                                            
  open(status: TaskStatus = 'todo'): void {                               
    this.status = status;                                                                 
    this.dialog.nativeElement.showModal();
  }

  close(): void {
    this.dialog.nativeElement.close();
  }
}
