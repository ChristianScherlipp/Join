import { Component,input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-button-edit-delete',
  styleUrl: './button-edit-delete.scss',
  templateUrl: './button-edit-delete.html',
})
export class ButtonEditDelete {

    readonly typeStr = input<'edit' | 'delete'>('edit');

    readonly isDisabled = input(false);
  
    readonly actionClicked = output<void>();

    readonly needText = true

}
