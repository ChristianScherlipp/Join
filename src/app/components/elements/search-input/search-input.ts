import { Component, model, output, signal } from '@angular/core';

/** The search only starts from this many characters. */
const MIN_LENGHT = 3;

/**
 * Search field that only searches from three characters.
 *
 * @example
 * <app-search-input [(noResult)]="noResult" (searched)="onSearch($event)" (cleared)="onSearchCleared()" />
 */
@Component({
    imports: [],
    selector: 'app-search-input',
    styleUrl: './search-input.scss',
    templateUrl: './search-input.html',
})
export class SearchInput {
    /** true = no results, the text in the field turns red. Bindable from the parent via [(noResult)]. */
    readonly noResult = model(false);

    /** Emits the search text (click on the icon or Enter) if it has at least 3 characters. */
    readonly searched = output<string>();

    /** Emits that the field is empty (show all cards again). */
    readonly cleared = output<void>();

    readonly value = signal('');

    /** true = the "too few characters" hint is shown briefly. */
    readonly tooShort = signal(false);

    private hintTimer?: ReturnType<typeof setTimeout>;

    /**
     * Takes over the entered text and hides error states.
     *
     * @param {Event} event - The input event.
     * @returns {void}
     */
    onInput(event: Event): void {
        this.value.set((event.target as HTMLInputElement).value);
        this.noResult.set(false);
        this.tooShort.set(false);
    }

    /**
     * Starts the search. An empty field resets the search,
     * a text that is too short shows a hint.
     *
     * @returns {void}
     */
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

    /**
     * Resets the search if the field is empty when it is left.
     *
     * @returns {void}
     */
    onBlur(): void {
        if (this.value().trim() === '') {
            this.cleared.emit();
        }
    }

    /**
     * Shows the hint briefly and hides it again after 2.5 seconds.
     *
     * @returns {void}
     */
    private showTooShort(): void {
        this.tooShort.set(true);
        clearTimeout(this.hintTimer);
        this.hintTimer = setTimeout(() => this.tooShort.set(false), 2500);
    }
}
