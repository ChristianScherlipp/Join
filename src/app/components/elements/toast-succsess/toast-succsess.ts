import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-toast-success',
  templateUrl: './toast-succsess.html',
  styleUrl: './toast-succsess.scss',
})
export class ToastSuccess {
  // 'side': entra desde la derecha. 'up': sube desde abajo hasta el centro.
  readonly direction = input<'side' | 'up'>('side');
  readonly message = signal('');
  private timer?: number;

  show(text: string, duration = 2000): void {
    window.clearTimeout(this.timer);
    this.message.set(text);
    this.timer = window.setTimeout(() => this.message.set(''), duration);
  }
}
