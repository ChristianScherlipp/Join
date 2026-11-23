import { Component, input, signal } from '@angular/core';

/**
 * Short message that slides in from the side or from the bottom.
 */
@Component({
  selector: 'app-toast-success',
  templateUrl: './toast-succsess.html',
  styleUrl: './toast-succsess.scss',
})
export class ToastSuccess {
  /** 'side' comes in from the right, 'up' rises from the bottom to the center. */
  readonly direction = input<'side' | 'up'>('side');
  readonly message = signal('');
  private timer?: number;

  /**
   * Shows a message and hides it again after the duration.
   *
   * @param {string} text - The text of the message.
   * @param {number} [duration=2000] - Display duration in milliseconds.
   * @returns {void}
   */
  show(text: string, duration = 2000): void {
    window.clearTimeout(this.timer);
    this.message.set(text);
    this.timer = window.setTimeout(() => this.message.set(''), duration);
  }
}
