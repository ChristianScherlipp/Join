import { Injectable } from '@angular/core';

/**
 * Provides initials and fixed colors for contact avatars.
 */
@Injectable({
  providedIn: 'root',
})
export class ContactAvatar {
  private readonly colors = [
    '#FF7A00',
    '#9327FF',
    '#6E52FF',
    '#FC71FF',
    '#00BEE8',
    '#1FD7C1',
    '#FF4646',
  ];

  /**
   * Builds the initials from the first two parts of a name.
   * Example: "Max Mustermann" becomes "MM".
   *
   * @param {string} name - The full name.
   * @returns {string} The initials in uppercase.
   */
  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    let initials = '';

    for (let index = 0; index < parts.length && index < 2; index++) {
      initials += parts[index].charAt(0);
    }

    return initials.toUpperCase();
  }

  /**
   * Calculates a fixed color from the name.
   * This way the list and the contact card get the same color.
   *
   * @param {string} name - The full name.
   * @returns {string} A hex color value from the color palette.
   */
  getColor(name: string): string {
    let hash = 0;

    for (const character of name) {
      hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    }

    return this.colors[hash % this.colors.length];
  }

  /**
   * Picks a random preview color for the dialog.
   *
   * @returns {string} A random hex color value from the color palette.
   */
  getRandomColor(): string {
    const index = Math.floor(Math.random() * this.colors.length);

    return this.colors[index];
  }
}
