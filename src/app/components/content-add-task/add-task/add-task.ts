import { Component, inject } from '@angular/core';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonPriority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';
import { DropDownCategory } from '../../elements/drop-down-category/drop-down-category';
import { Subtask } from '../../elements/subtask/subtask';
import { FieldError } from '../../../services/field-error';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [ButtonPrimary, ButtonPriority, DropDownAssignedto, DropDownCategory, Subtask, FormsModule],
  providers: [FieldError],
  selector: 'app-add-task',
  styleUrl: './add-task.scss',
  templateUrl: './add-task.html',
})
export class AddTask {
  readonly fieldError = inject(FieldError);
  title = '';
  dueDate = '';
}
