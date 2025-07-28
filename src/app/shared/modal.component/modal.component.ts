import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-modal',
	imports: [],
	templateUrl: './modal.component.html',
	styleUrl: './modal.component.css',
})
export class ModalComponent {
	@Input() show = false;
	@Output() closed = new EventEmitter<void>();

	close() {
		this.closed.emit();
	}

	onBackdropClick() {
		this.close();
	}
}
