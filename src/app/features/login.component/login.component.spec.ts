import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { LoginService } from '../../core/services/api/login/login.service';

interface FakeTokenClient {
	requestAccessToken: jasmine.Spy;
	__callback?: (response: any) => void;
}

describe('LoginComponent', () => {
	let component: LoginComponent;
	let fixture: ComponentFixture<LoginComponent>;
	let loginServiceSpy: jasmine.SpyObj<LoginService>;
	let tokenClientSpy: FakeTokenClient;

	beforeEach(async () => {
		loginServiceSpy = jasmine.createSpyObj<LoginService>('LoginService', [
			'login',
			'googleLogin',
		]);

		tokenClientSpy = {
			requestAccessToken: jasmine.createSpy('requestAccessToken'),
		};

		(globalThis as any).google = {
			accounts: {
				oauth2: {
					initTokenClient: jasmine
						.createSpy('initTokenClient')
						.and.callFake((config: any) => {
							tokenClientSpy.__callback = config.callback;
							return tokenClientSpy;
						}),
				},
			},
		};

		await TestBed.configureTestingModule({
			imports: [ReactiveFormsModule, LoginComponent],
			providers: [
				FormBuilder,
				{ provide: LoginService, useValue: loginServiceSpy },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(LoginComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create component', () => {
		expect(component).toBeTruthy();
	});

	it('should call loginService.login when form is valid', () => {
		component.form.setValue({ username: 'test', password: 'pass' });
		loginServiceSpy.login.and.returnValue(of({ token: 'mock-token' }));

		spyOn(component, 'close');
		component.submit();

		expect(loginServiceSpy.login).toHaveBeenCalledWith('test', 'pass');
		expect(component.close).toHaveBeenCalled();
	});

	it('should set error signals when login fails', () => {
		component.form.setValue({ username: 'test', password: 'pass' });
		loginServiceSpy.login.and.returnValue(
			throwError(() => ({ message: 'Invalid credentials' })),
		);

		component.submit();

		expect(component.isLoginFailOpen()).toBeTrue();
		expect(component.LoginFailMessage()).toBe('Invalid credentials');
	});

	it('should call googleLogin on successful Google credential', () => {
		loginServiceSpy.googleLogin.and.returnValue(
			of({ token: 'mock-google-token' }),
		);

		spyOn(component, 'close');
		component.handleGoogleCredential({ access_token: 'abc123' });

		expect(loginServiceSpy.googleLogin).toHaveBeenCalledWith('abc123');
		expect(component.close).toHaveBeenCalled();
	});

	it('should set error signals on googleLogin error', () => {
		loginServiceSpy.googleLogin.and.returnValue(
			throwError(() => ({ message: 'Google login failed' })),
		);

		component.handleGoogleCredential({ access_token: 'abc123' });

		expect(component.isLoginFailOpen()).toBeTrue();
		expect(component.LoginFailMessage()).toBe('Google login failed');
	});

	it('should request Google access token when onGoogleLoginClick is called', () => {
		component.onGoogleLoginClick();
		expect(tokenClientSpy.requestAccessToken).toHaveBeenCalled();
	});

	it('should emit closed event when close() is called', () => {
		spyOn(component.closed, 'emit');
		component.close();
		expect(component.closed.emit).toHaveBeenCalled();
	});

	it('should initialize tokenClient on ngOnInit', () => {
		component.ngOnInit();
		expect(
			(globalThis as any).google.accounts.oauth2.initTokenClient,
		).toHaveBeenCalled();
	});

	it('should trigger handleGoogleCredential when tokenClient callback is called', () => {
		spyOn(component, 'handleGoogleCredential');
		component.ngOnInit();
		tokenClientSpy.__callback?.({ access_token: 'cb_token' });
		expect(component.handleGoogleCredential).toHaveBeenCalledWith({
			access_token: 'cb_token',
		});
	});
});
