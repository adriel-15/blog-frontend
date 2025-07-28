import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComponent } from './modal.component';
import { By } from '@angular/platform-browser';

describe('ModalComponent', () => {
	let component: ModalComponent;
	let fixture: ComponentFixture<ModalComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ModalComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ModalComponent);
		component = fixture.componentInstance;

		// Set up projected content manually via nativeElement.innerHTML
		const projectedContent = document.createElement('p');
		projectedContent.classList.add('modal-body');
		projectedContent.textContent = 'Projected content';

		fixture.nativeElement
			.querySelector('.modal-content')
			?.appendChild(projectedContent);

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit closed when clicking backdrop', () => {
		spyOn(component.closed, 'emit');
		const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
		backdrop.triggerEventHandler('click', new MouseEvent('click'));
		expect(component.closed.emit).toHaveBeenCalled();
	});

	it('should not emit closed when clicking content', () => {
		spyOn(component.closed, 'emit');
		const content = fixture.debugElement.query(By.css('.modal-content'));
		content.triggerEventHandler('click', new MouseEvent('click'));
		expect(component.closed.emit).not.toHaveBeenCalled();
	});

	it('should render projected content manually', () => {
		const content = fixture.nativeElement.querySelector('.modal-body');
		expect(content?.textContent.trim()).toBe('Projected content');
	});

	it('should emit closed when close() is called directly', () => {
		spyOn(component.closed, 'emit');
		component.close();
		expect(component.closed.emit).toHaveBeenCalled();
	});

	it('should call close() when onBackdropClick() is called', () => {
		spyOn(component, 'close');
		component.onBackdropClick();
		expect(component.close).toHaveBeenCalled();
	});
});
