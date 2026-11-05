import { Service, signal } from '@angular/core';

@Service()
export class FieldError {
     // Namen der Felder, deren Meldung gerade sichtbar ist.
    readonly visible = signal<string[]>([]);

    // Merkt sich pro Feld den Timer, der die Meldung ausblendet.
    private readonly timers = new Map<string, number>();

    /**
    * Zeigt die Meldung für 5 Sekunden, wenn das Feld leer ist.
    */
    checkRequired(field: string, value: string): void {
        if (value.trim()) {
            return;
        }

        this.clearTimer(field);
        this.visible.update((fields) => [...fields.filter((name) => name !== field), field]);
        this.timers.set(field, window.setTimeout(() => this.hide(field), 5000));
    }

    isVisible(field: string): boolean {
        return this.visible().includes(field);
    }

    // Blendet alle Meldungen aus und stoppt alle Timer.
    reset(): void {
        this.timers.forEach((timer) => window.clearTimeout(timer));
        this.timers.clear();
        this.visible.set([]);
    }

    ngOnDestroy(): void {
        this.reset();
    }

    private hide(field: string): void {
        this.clearTimer(field);
        this.visible.update((fields) => fields.filter((name) => name !== field));
    }

    private clearTimer(field: string): void {
        window.clearTimeout(this.timers.get(field));
        this.timers.delete(field);
    }
}
