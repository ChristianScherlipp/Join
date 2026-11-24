import { Service, signal } from '@angular/core';

const REQUIRED = 'This field is required';

const EMAIL_PATTERN =
    /^[^\s@]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

/**
 * A rule validates a value.
 * An empty string means valid, otherwise it contains the error message.
 */
type Rule = (value: string) => string;

/**
 * Validates a name: required, no digits, at least one letter.
 *
 * @param {string} value - The entered name.
 * @returns {string} The error message or an empty string.
 */
function checkName(value: string): string {
    if (!value.trim()) {
        return REQUIRED;
    }
    const isValid = !/\d/.test(value) && /\p{L}/u.test(value);
    return isValid ? '' : 'Name must not contain numbers';
}

/**
 * Validates an email address after trimming surrounding whitespace.
 * Exactly one @, a valid domain and an ending with at least 2 letters.
 *
 * @param {string} value - The entered email address.
 * @returns {string} The error message or an empty string.
 */
function checkEmail(value: string): string {
    if (!value.trim()) {
        return REQUIRED;
    }
    const isValid = EMAIL_PATTERN.test(value.trim());
    return isValid ? '' : 'Please enter a valid email address';
}

/**
 * Validates a phone number: optional leading +, then 1 to 15 digits.
 *
 * @param {string} value - The entered phone number.
 * @returns {string} The error message or an empty string.
 */
function checkPhone(value: string): string {
    if (!value.trim()) {
        return REQUIRED;
    }
    const isValid = /^\+?\d{1,15}$/.test(value.trim());
    return isValid ? '' : 'Please enter a valid Phone number(max. 15 digits)';
}

/**
 * Validates a title. Whitespace only counts as empty.
 *
 * @param {string} value - The entered title.
 * @returns {string} The error message or an empty string.
 */
function checkTitle(value: string): string {
    return value.trim() ? '' : REQUIRED;
}

/**
 * Validates a due date in the format YYYY-MM-DD. It must not be in the past.
 *
 * @param {string} value - The selected date.
 * @returns {string} The error message or an empty string.
 */
function checkDueDate(value: string): string {
    if (!value) {
        return REQUIRED;
    }
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${now.getFullYear()}-${month}-${day}`;
    return value >= today ? '' : 'Date must not be in the past';
}

/**
 * Checks whether a category has been selected.
 *
 * @param {string} value - The selected category.
 * @returns {string} The error message or an empty string.
 */
function checkCategory(value: string): string {
    return value ? '' : REQUIRED;
}

const rules: Record<string, Rule> = {
    name: checkName,
    email: checkEmail,
    phone: checkPhone
}

const addTaskRules: Record<string, Rule> = {
    title: checkTitle,
    dueDate: checkDueDate,
    category: checkCategory
}

/**
 * Manages error messages of form fields without HTML5 validation.
 */
@Service()
export class FieldError {
    /** Currently visible message per field. */
    readonly messages = signal<Record<string, string>>({});

    /**
     * Validates a field and shows the message on error.
     *
     * @param {string} field - The field name.
     * @param {string} value - The field value.
     * @returns {boolean} true = valid, false = invalid.
     */
    check(field: string, value: string): boolean {
        const rule = rules[field] ?? addTaskRules[field];
        const message = rule(value);

        if (message) {
            this.show(field, message);
        } else {
            this.hide(field);
        }

        return !message;
    }

    /**
     * Validates all contact fields at once so that all errors become visible.
     *
     * @param {Record<string, string>} values - The field values by field name.
     * @returns {boolean} true if all fields are valid.
     */
    validateAll(values: Record<string, string>): boolean {
        const results = Object.keys(rules).map((field) => this.check(field, values[field] ?? ''));
        return results.every(Boolean);
    }

    /**
     * Validates all contact fields silently without showing a message.
     *
     * @param {Record<string, string>} values - The field values by field name.
     * @returns {boolean} true if all fields are valid.
     */
    isValid(values: Record<string, string>): boolean {
        return Object.keys(rules).every((field) => !rules[field](values[field] ?? ''));
    }

    /**
     * Validates a single field silently without showing a message.
     *
     * @param {string} field - The field name.
     * @param {string} value - The field value.
     * @returns {boolean} true = valid, false = invalid.
     */
    isFieldValid(field: string, value: string): boolean {
        const rule = rules[field] ?? addTaskRules[field];
        return !rule(value);
    }

    /**
     * Tells whether a message is visible for a field.
     *
     * @param {string} field - The field name.
     * @returns {boolean} true if a message is shown.
     */
    isVisible(field: string): boolean {
        return !!this.messages()[field];
    }

    /**
     * Returns the current message of a field.
     *
     * @param {string} field - The field name.
     * @returns {string} The message or an empty string.
     */
    message(field: string): string {
        return this.messages()[field] ?? '';
    }

    /**
     * Hides all messages.
     *
     * @returns {void}
     */
    reset(): void {
        this.messages.set({});
    }

    /**
     * Hides all messages when the component is destroyed.
     *
     * @returns {void}
     */
    ngOnDestroy(): void {
        this.reset();
    }

    /**
     * Shows the message of a field.
     *
     * @param {string} field - The field name.
     * @param {string} message - The error message.
     * @returns {void}
     */
    private show(field: string, message: string): void {
        this.messages.update((current) => ({ ...current, [field]: message }));
    }

    /**
     * Hides the message of a field.
     *
     * @param {string} field - The field name.
     * @returns {void}
     */
    private hide(field: string): void {
        this.messages.update(({ [field]: removed, ...rest }) => rest);
    }
}
