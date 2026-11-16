import { Component, model, output, signal } from '@angular/core';

//Erst ab so vielen Zeichen wird beim Klick auf das Icon gesucht.
const MIN_LENGHT = 3;

@Component({
    imports: [],
    selector: 'app-search-input',
    styleUrl: './search-input.scss',
    templateUrl: './search-input.html',
})
export class SearchInput {
    // true = keine  Treffer, der Text im Feld wird rot. Per [(noResult)] vom Parent bindbar.
    readonly noResult = model(false);

    //Meldet den Suchtext, wenn auf das Icon geklickt wird und mindestens 3 Zeichen drin stehen.
    readonly searched = output<string>();

    //Meldet, dass das Feld leer ist und verlassen wurde (alle Karten wieder zeigen).
    readonly cleared = output<void>();

    readonly value = signal('');

    onInput(event: Event): void {
        this.value.set((event.target as HTMLInputElement).value);
        this.noResult.set(false);
    }

    search(): void {
        const query = this.value().trim();
        if (query.length >= MIN_LENGHT) {
            this.searched.emit(query);
        }
    }

    onBlur(): void {
        if (this.value().trim()  === '') {
            this.cleared.emit();
        }
    }
}