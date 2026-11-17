import { Component, ElementRef, HostListener, inject, model, signal } from '@angular/core';
import { FieldError } from '../../../services/field-error';

export type Category = 'Technical Task' | 'User Story';

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

    //Gewählte Kategorie, per [(selectedCategory)] vom Parent bindbar.
    readonly selectedCategory = model<Category | null>(null);

    readonly isOpen = signal(false);

    isSelected(option: Category): boolean {
        return this.selectedCategory() === option;
    }

    //Übernimmt die Auswahl und schließt die Liste.
    selectCategory(option: Category): void {
        this.selectedCategory.set(option);
        this.fieldError.check('category', option);
        this.closeList();
    }

    toggleList(): void {
        this.isOpen.update((open) => !open);
    }

    closeList(): void {
        this.isOpen.set(false);
    }

    //Schließt die Liste, wenn außerhalb des Elements geklickt wird.
    @HostListener('document:click', ['$event'])
    closeOnOutsideClick(event: MouseEvent): void {
        if (!this.host.nativeElement.contains(event.target as Node)) {
            // Nur prüfen, wenn die Liste offen war.
            if (this.isOpen()) {
                this.fieldError.check('category', this.selectedCategory() ?? '');
            }
            this.closeList();
        }
    }
}
