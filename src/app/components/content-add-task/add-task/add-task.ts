import { Component } from '@angular/core';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonPriority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';

@Component({
  imports: [ButtonPrimary, ButtonPriority, DropDownAssignedto],
  selector: 'app-add-task',
  styleUrl: './add-task.scss',
  templateUrl: './add-task.html',
})
export class AddTask {}
