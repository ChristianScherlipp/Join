import { Service, signal } from '@angular/core';

const REQUIRED = 'This field is required';

//jede Regel gibt eine Fehlermeldung zurück. Ein leerer Text bedeutet: gültig
type Rule = (value: string) => string;

function checkName(value: string): string {
    if (!value.trim()) {
        return REQUIRED;
    }
    // Keine Zahlen erlaubt, mindestens ein Buchstabe nötig.
    const isValid = !/\d/.test(value) && /\p{L}/u.test(value);
    return isValid ? '' : 'Name must not contain numbers';
}

function checkEmail(value:string): string {
    if (!value.trim()) {
        return REQUIRED;
    }
    //Text vor und nach dem @, danach eine Domain mit Punkt, keine Leerzeichen.
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
    return isValid ? '' : 'Please enter a valid email address';
}

function checkPhone(value:string): string {
    if (!value.trim()) {
        return REQUIRED;
    }
    // Optinales + nur am Anfang, danach 1 bis 15 Ziffern, keine Leerzeichen.
    const isValid = /^\+?\d{1,15}$/.test(value.trim());
    return isValid ? '' : 'Please enter a valid Phone number(max. 15 digits)';
}

const rules: Record<string, Rule> = {
    name: checkName,
    email: checkEmail,
    phone: checkPhone,
}

@Service()
export class FieldError {
     // Aktuell sichtbare Meldung pro Feld
    readonly messages = signal<Record<string, string>>({});

    /**
    * Prüft ein Feld. Bei einem Fehler wird die Meldung 5 Sekunden angezeigt.
    * true = gültig, false = ungültig.
    */
    check(field: string, value: string): boolean {
        const message = rules[field](value);

        if (message) {
            this.show(field, message);
        } else {
            this.hide(field);
        }

        return !message;
    }

    // Prüft alle Felder auf einmal, damit alle Fehler sichtbar werden.
    validateAll(values: Record<string, string>): boolean {
        const results = Object.keys(rules).map((field) => this.check(field, values[field] ?? ''));
        return results.every(Boolean);
    }

    //Prüft alle Felder still, ohne Meldung anzuzeigen (z.B. für den save-Button).
    isValid(values: Record<string, string>): boolean {
        return Object.keys(rules).every((field) => !rules[field](values[field] ?? ''));
    }

    isVisible(field: string): boolean {
        return !!this.messages()[field];
    }

    message(field: string): string {
        return this.messages()[field] ?? '';
    }

    // Blendet alle Meldungen aus und stoppt alle Timer.
    reset(): void {
        this.messages.set({});
    }

    ngOnDestroy(): void {
        this.reset();
    }

    private show(field: string, message: string): void {
        this.messages.update((current) => ({ ...current, [field]: message }));
    }

    private hide(field: string): void {
        this.messages.update(({ [field]: removed, ...rest }) => rest);
    }
}
