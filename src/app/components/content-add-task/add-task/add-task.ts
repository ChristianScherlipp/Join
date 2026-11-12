import { Component } from '@angular/core';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';

@Component({
  imports: [ButtonPrimary],
  selector: 'app-add-task',
  styleUrl: './add-task.scss',
  templateUrl: './add-task.html',
})
export class AddTask {}
