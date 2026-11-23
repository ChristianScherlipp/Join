import { Component, ElementRef, HostListener, inject, model, signal } from '@angular/core';
import { FieldError } from '../../../services/field-error';

/** The selectable categories. */
export type Category = 'Technical Task' | 'User Story';

/**
 * Dropdown for selecting the category of a task.
 *
 * @example
 * <app-drop-down-category [(selectedCategory)]="category" />
 */
@Component({
    imports: [],
    selector: 'app-drop-down-category',
    styleUrl: './drop-down-category.scss',
    templateUrl: './drop-down-category.html',
})
export class DropDownCategory {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly fieldError = inject(FieldError);

    readonly categories: Category[] = ['Technical Task', 'User Story'];

    /** Selected category, bindable from the parent via [(selectedCategory)]. */
    readonly selectedCategory = model<Category | null>(null);

    readonly isOpen = signal(false);

    /**
     * Checks whether a category is selected.
     *
     * @param {Category} option - The category.
     * @returns {boolean} true if the category is selected.
     */
    isSelected(option: Category): boolean {
        return this.selectedCategory() === option;
    }

    /**
     * Takes over the selection and closes the list.
     *
     * @param {Category} option - The selected category.
     * @returns {void}
     */
    selectCategory(option: Category): void {
        this.selectedCategory.set(option);
        this.fieldError.check('category', option);
        this.closeList();
    }

    /**
     * Opens the list or closes it again.
     *
     * @returns {void}
     */
    toggleList(): void {
        this.isOpen.update((open) => !open);
    }

    /**
     * Closes the list.
     *
     * @returns {void}
     */
    closeList(): void {
        this.isOpen.set(false);
    }

    /**
     * Closes the list when clicking outside the element.
     * If the list was open, the category is also validated.
     *
     * @param {MouseEvent} event - The click event.
     * @returns {void}
     */
    @HostListener('document:click', ['$event'])
    closeOnOutsideClick(event: MouseEvent): void {
        if (!this.host.nativeElement.contains(event.target as Node)) {
            if (this.isOpen()) {
                this.fieldError.check('category', this.selectedCategory() ?? '');
            }
            this.closeList();
        }
    }
}
