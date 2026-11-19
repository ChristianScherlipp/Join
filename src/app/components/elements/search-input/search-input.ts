import { Component, model, output, signal } from '@angular/core';

// Erst ab so vielen Zeichen wird gesucht.
const MIN_LENGHT = 3;

@Component({
    imports: [],
    selector: 'app-search-input',
    styleUrl: './search-input.scss',
    templateUrl: './search-input.html',
})
export class SearchInput {
    // true = keine Treffer, der Text im Feld wird rot. Per [(noResult)] vom Parent bindbar.
    readonly noResult = model(false);

    // Meldet den Suchtext (Klick auf das Icon oder Enter), wenn mindestens 3 Zeichen drin stehen.
    readonly searched = output<string>();

    // Meldet, dass das Feld leer ist (alle Karten wieder zeigen).
    readonly cleared = output<void>();

    readonly value = signal('');

    // true = Hinweis "zu wenige Zeichen" wird kurz angezeigt.
    readonly tooShort = signal(false);

    private hintTimer?: ReturnType<typeof setTimeout>;              

    onInput(event: Event): void {
        this.value.set((event.target as HTMLInputElement).value);
        this.noResult.set(false);
        this.tooShort.set(false);                                        
    }

    search(): void {
        const query = this.value().trim();
        if (query === '') {
            this.cleared.emit();
            return;
        }
        if (query.length < MIN_LENGHT) {
            this.showTooShort();                                         
            return;
        }
        this.searched.emit(query);
    }

    onBlur(): void {
        if (this.value().trim() === '') {
            this.cleared.emit();
        }
    }

    // Zeigt den Hinweis kurz an und blendet ihn nach 2,5 Sekunden wieder aus.
    private showTooShort(): void {                                      
        this.tooShort.set(true);
        clearTimeout(this.hintTimer);
        this.hintTimer = setTimeout(() => this.tooShort.set(false), 2500);
    }
}