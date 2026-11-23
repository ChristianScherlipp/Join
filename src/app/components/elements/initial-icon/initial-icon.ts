import { Component, computed, input } from '@angular/core';

const colors = [
  '#ff7a00',
  '#9327ff',
  '#ff745e',
  '#ffc701',
  '#ff5eb3',
  '#00bee8',
  '#ffa35e',
  '#0038ff',
  '#ff4646',
  '#6e52ff',
  '#1fd7c1',
  '#fc71ff',
  '#ffbb2b',
];

/**
 * Round avatar with the initials of a name.
 *
 * @example
 * <app-initial-icon [name]="contact.name" [withShadow]="true" />
 */
@Component({
  imports: [],
  selector: 'app-initial-icon',
  styleUrl: './initial-icon.scss',
  templateUrl: './initial-icon.html',
})
export class InitialIcon {
  readonly name = input.required<string>();
  readonly isHeader = input<boolean>(false);
  readonly withShadow = input<boolean>(false);
  readonly isPlaceholder = input<boolean>(false);

  /** The individual words of the name in uppercase. */
  words = computed(() => {
    return this.name()
      .toUpperCase()
      .split(' ')
      .filter(word => word.length > 0);
  });

  /** First letter of the first and the last word. */
  initials = computed(() => {
    const words = this.words();
    if (words.length > 1) {
      const first = words[0].charAt(0);
      const last = words[words.length - 1].charAt(0);
      return first + last;
    } else if (words.length === 1) {
      return words[0].charAt(0);
    } else {
      return '';
    }
  });

  /** The color matching the name. */
  color = computed(() => {
    const name = this.words().join(' ');
    const index = this.getColorIndex(name);
    return colors[index];
  });

  /** The background color depending on header, placeholder and initials. */
  backgroundColor = computed(() => {
    if (this.isHeader()) {
      return '';
    } else if (this.isPlaceholder() || this.initials() === '') {
      return '#d1d1d1';
    } else {
      return this.color();
    }
  });

  /**
   * Calculates the index of a color from a name.
   *
   * @param {string} name - The name in uppercase.
   * @returns {number} The index in the color list.
   */
  getColorIndex(name: string): number {
    let hash = 0;
    for (const char of name) {
      hash = hash * 31 + char.charCodeAt(0);
      hash |= 0;
    }
    return Math.abs(hash) % colors.length;
  }
}
