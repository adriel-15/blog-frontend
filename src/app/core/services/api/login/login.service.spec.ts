import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LoginService, JwtDto } from './login.service';
import { UserStateService } from '../../state/user/user-state.service';

describe('LoginService', () => {
	let service: LoginService;
	let httpSpy: jasmine.SpyObj<HttpClient>;
	let userStateSpy: jasmine.SpyObj<UserStateService>;

	beforeEach(() => {
		httpSpy = jasmine.createSpyObj('HttpClient', ['post']);
		userStateSpy = jasmine.createSpyObj('UserStateService', [
			'setUserFromToken',
			'clearUser',
		]);

		TestBed.configureTestingModule({
			providers: [
				LoginService,
				{ provide: HttpClient, useValue: httpSpy },
				{ provide: UserStateService, useValue: userStateSpy },
			],
		});

		service = TestBed.inject(LoginService);
	});

	// -------------------------
	// LOGIN TESTS
	// -------------------------
	describe('login', () => {
		it('should call setUserFromToken on success', () => {
			const mockResponse: JwtDto = { token: 'mock-token' };
			httpSpy.post.and.returnValue(of(mockResponse));

			service.login('user', 'pass').subscribe((res) => {
				expect(res).toEqual(mockResponse);
			});

			const expectedHeaders = new HttpHeaders({
				Authorization: 'Basic ' + btoa('user:pass'),
			});

			expect(httpSpy.post).toHaveBeenCalledWith(
				jasmine.any(String),
				{},
				jasmine.objectContaining({
					headers: jasmine.any(HttpHeaders),
				}),
			);
			expect(userStateSpy.setUserFromToken).toHaveBeenCalledWith(
				'mock-token',
			);
		});

		it('should throw "Incorrect username or password" on non-zero status error', () => {
			const errorResponse = { status: 401 };
			httpSpy.post.and.returnValue(throwError(() => errorResponse));

			service.login('user', 'wrong-pass').subscribe({
				next: () => fail('Expected error, but got success'),
				error: (err) => {
					expect(err.status).toBe(401);
					expect(err.message).toBe('Incorrect username or password');
				},
			});
		});

		it('should throw "System down" on status 0 error', () => {
			const errorResponse = { status: 0 };
			httpSpy.post.and.returnValue(throwError(() => errorResponse));

			service.login('user', 'pass').subscribe({
				next: () => fail('Expected error, but got success'),
				error: (err) => {
					expect(err.status).toBe(0);
					expect(err.message).toBe('System down, try again later :(');
				},
			});
		});
	});

	// -------------------------
	// GOOGLE LOGIN TESTS
	// -------------------------
	describe('googleLogin', () => {
		it('should call setUserFromToken on success', () => {
			const mockResponse: JwtDto = { token: 'mock-google-token' };
			httpSpy.post.and.returnValue(of(mockResponse));

			service.googleLogin('test-token').subscribe((res) => {
				expect(res).toEqual(mockResponse);
			});

			expect(httpSpy.post).toHaveBeenCalledWith(jasmine.any(String), {
				googleAccessToken: 'test-token',
			});
			expect(userStateSpy.setUserFromToken).toHaveBeenCalledWith(
				'mock-google-token',
			);
		});

		it('should throw "Google login failed" on non-zero status error', () => {
			const errorResponse = { status: 401 };
			httpSpy.post.and.returnValue(throwError(() => errorResponse));

			service.googleLogin('bad-token').subscribe({
				next: () => fail('Expected error, but got success'),
				error: (err) => {
					expect(err.status).toBe(401);
					expect(err.message).toBe('Google login failed');
				},
			});
		});

		it('should throw "System down" on status 0 error', () => {
			const errorResponse = { status: 0 };
			httpSpy.post.and.returnValue(throwError(() => errorResponse));

			service.googleLogin('any-token').subscribe({
				next: () => fail('Expected error, but got success'),
				error: (err) => {
					expect(err.status).toBe(0);
					expect(err.message).toBe('System down, try again later :(');
				},
			});
		});
	});

	// -------------------------
	// LOGOUT TEST
	// -------------------------
	describe('logout', () => {
		it('should clear user', () => {
			service.logout();
			expect(userStateSpy.clearUser).toHaveBeenCalled();
		});
	});
});
