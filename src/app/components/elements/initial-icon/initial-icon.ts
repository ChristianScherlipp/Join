
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

initials = computed(() => {
  const words = this.name()
    .toUpperCase()
    .split(' ')
    .filter(word => word.length > 0);
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

  getColorIndex(name: string) {
    let hash = 0;
    for (const char of name) {
      hash = hash * 31 + char.charCodeAt(0);
      hash |= 0;
    }
    return Math.abs(hash) % colors.length;
  }

  color = computed(() => {
    const name = this.name();
    const index = this.getColorIndex(name);
    return colors[index];
  });

  backgroundColor = computed(() => {
  if (this.isHeader()) {
    return '';
  } else if (this.isPlaceholder() || this.initials() === '') {
    return '#d1d1d1';
  } else {
    return this.color();
  }
});
}

