import { Component, input } from '@angular/core';

/**
 * The available appearances of the primary button.
 */
enum BtnType {
    Light = 'light',
    CreateTask = 'createTask',
    AddTask = 'addTask',
    AddContact = 'addContact',
    AddTaskSmall = 'addTaskSmall',
    Cancel = 'cancel',
    Dark = 'dark',
}

/**
 * Primary button with selectable appearance and icon.
 *
 * @example
 * <app-button-primary typeStr="createTask" widthStr="7rem" buttonType="submit">Save</app-button-primary>
 */
@Component({
    imports: [],
    selector: 'app-button-primary',
    styleUrl: './button-primary.scss',
    templateUrl: './button-primary.html',
})
export class ButtonPrimary {
    readonly widthStr = input<string | null>(null);
    readonly small = input<boolean>(false);
    readonly typeStr = input<string>(BtnType.Dark);
    readonly isDisabled = input<boolean>(false);
    readonly isActive = input<boolean>(false);
    readonly buttonType = input<'button' | 'submit'>('button');

    /** The icon per appearance. */
    btnSrc = new Map<string, string>([
        ['dark', ''],
        ['light', ''],
        ['createTask', './assets/icons/check.svg'],
        ['addTask', './assets/icons/plus-btn-default.svg'],
        ['addTaskSmall', './assets/icons/plus-btn-default.svg'],
        ['addContact', './assets/icons/person_add.svg'],
        ['cancel', './assets/icons/cancel.svg']
    ])
}
