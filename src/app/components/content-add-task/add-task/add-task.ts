import { Component } from '@angular/core';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonPriority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';
import { DropDownCategory } from '../../elements/drop-down-category/drop-down-category';
import { Subtask } from '../../elements/subtask/subtask';

@Component({
  imports: [ButtonPrimary, ButtonPriority, DropDownAssignedto, DropDownCategory, Subtask],
  selector: 'app-add-task',
  styleUrl: './add-task.scss',
  templateUrl: './add-task.html',
})
export class AddTask {}
