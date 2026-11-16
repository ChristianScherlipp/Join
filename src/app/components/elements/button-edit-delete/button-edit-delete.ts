import { Component, computed,input, output } from '@angular/core';

const ICONS = {
  edit: 'assets/icons/edit.svg',
  delete: 'assets/icons/delete.svg',
  save: 'assets/icons/check.svg'
};

const LABELS = { edit: 'Edit', delete: 'Delete', save: 'Save' }

@Component({
  imports: [],
  selector: 'app-button-edit-delete',
  styleUrl: './button-edit-delete.scss',
  templateUrl: './button-edit-delete.html',
})
export class ButtonEditDelete {

    readonly typeStr = input<'edit' | 'delete' | 'save'>('edit');

    readonly isDisabled = input(false);

    //false = nur das Icon, ohne Text.
    readonly needText = input(true);
  
    readonly actionClicked = output<void>();

    readonly iconSrc = computed(() => ICONS[this.typeStr()]);

    readonly label = computed(() => LABELS[this.typeStr()]);

}
