import { Injectable } from '@angular/core';

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
   * Bildet die Initialen aus den ersten beiden Namensteilen.
   * Beispiel: Max Mustermann wird zu MM.
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
   * Berechnet eine feste Farbe aus dem Namen.
   * So haben Liste und Kontaktkarte dieselbe Farbe.
   */
  getColor(name: string): string {
    let hash = 0;

    // Wandelt den Namen in eine positive Zahl um.
    // Diese Berechnung erhält die bisherigen Kontaktfarben.
    for (const character of name) {
      hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    }

    const index = hash % this.colors.length;

    return this.colors[index];
  }

  /**
   * Wählt eine zufällige Vorschaufarbe für den Dialog.
   */
  getRandomColor(): string {
    const index = Math.floor(Math.random() * this.colors.length);

    return this.colors[index];
  }
}