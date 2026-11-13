import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ButtonPriority } from '../../elements/button-priority/button-priority';
import { DropDownAssignedto } from '../../elements/drop-down-assignedto/drop-down-assignedto';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { DropDownCategory } from '../../elements/drop-down-category/drop-down-category';

@Component({
  imports: [ButtonPriority, DropDownAssignedto, ButtonPrimary, DropDownCategory],
  selector: 'app-add-task-dialog',
  styleUrl: './add-task-dialog.scss',
  templateUrl: './add-task-dialog.html',
})
export class AddTaskDialog implements AfterViewInit {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  // TEMPORÄR: öffnet den Dialog beim Laden der Seite, damit man ihn sehen kann
  ngAfterViewInit() {
    this.dialog.nativeElement.showModal();
  }

  close(): void {
  this.dialog.nativeElement.close();
}
}
