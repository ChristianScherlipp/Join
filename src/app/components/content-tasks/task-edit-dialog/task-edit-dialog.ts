import { Component } from '@angular/core';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonPriority } from '../../elements/button-priority/button-priority';

@Component({
  imports: [ButtonPrimary,ButtonPriority],
  selector: 'app-task-edit-dialog',
  styleUrl: './task-edit-dialog.scss',
  templateUrl: './task-edit-dialog.html',
})
export class TaskEditDialog {}
