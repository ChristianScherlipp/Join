import { Component } from '@angular/core';
import { ButtonEditDelete } from '../../elements/button-edit-delete/button-edit-delete';

@Component({
  imports: [ButtonEditDelete],
  selector: 'app-task-dialog',
  styleUrl: './task-dialog.scss',
  templateUrl: './task-dialog.html',
})
export class TaskDialog {}
