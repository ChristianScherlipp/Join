import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-toast-success',
  templateUrl: './toast-succsess.html',
  styleUrl: './toast-succsess.scss',
})
export class ToastSuccess {
  readonly message = signal('');
  private timer?: number;

  show(text: string, duration = 3000): void {
    window.clearTimeout(this.timer);
    this.message.set(text);
    this.timer = window.setTimeout(() => this.message.set(''), duration);
  }
}