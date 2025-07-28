import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginService } from '../../core/services/api/login/login.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;
	let loginServiceSpy: jasmine.SpyObj<LoginService>;

	beforeEach(async () => {
		loginServiceSpy = jasmine.createSpyObj('LoginService', ['login']);

		await TestBed.configureTestingModule({
			imports: [LoginComponent, ReactiveFormsModule],
			providers: [{ provide: LoginService, useValue: loginServiceSpy }],
		}).compileComponents();

		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize the form with username and password controls', () => {
		expect(component.form.contains('username')).toBeTrue();
		expect(component.form.contains('password')).toBeTrue();
	});

	it('should not submit if form is invalid', () => {
		component.submit();
		expect(loginServiceSpy.login).not.toHaveBeenCalled();
	});

	it('should call loginService.login on valid form submission', () => {
		const mockCreds = { username: 'test', password: 'pass' };
		component.form.setValue(mockCreds);

		loginServiceSpy.login.and.returnValue(of({ token: 'mock-token' }));

		spyOn(component, 'close');
		component.submit();

		expect(loginServiceSpy.login).toHaveBeenCalledWith('test', 'pass');
		expect(component.close).toHaveBeenCalled();
	});

	it('should show login error if login fails', () => {
		component.form.setValue({ username: 'wrong', password: 'fail' });

		loginServiceSpy.login.and.returnValue(
			throwError(() => new Error('Invalid credentials')),
		);

		component.submit();

		expect(component.isLoginFailOpen()).toBeTrue();
		expect(component.LoginFailMessage()).not.toEqual('');
	});

	it('should emit "closed" event when close is called', () => {
		spyOn(component.closed, 'emit');
		component.close();
		expect(component.closed.emit).toHaveBeenCalled();
	});

	it('should hide login error when clicking on input field', () => {
		component.isLoginFailOpen.set(true);
		const usernameInput = fixture.debugElement.query(
			By.css('input[formControlName="username"]'),
		);
		usernameInput.triggerEventHandler('click');
		expect(component.isLoginFailOpen()).toBeFalse();
	});

	it('should hide login error when clicking the close icon', () => {
		component.isLoginFailOpen.set(true);
		fixture.detectChanges();

		const closeIcon = fixture.debugElement.query(By.css('.item2 span'));
		closeIcon.triggerEventHandler('click');
		expect(component.isLoginFailOpen()).toBeFalse();
	});
});
