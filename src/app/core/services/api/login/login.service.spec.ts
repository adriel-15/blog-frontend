import { TestBed } from '@angular/core/testing';

import { LoginService } from './login.service';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { UserStateService } from '../../state/user/user-state.service';
import { provideHttpClient } from '@angular/common/http';

describe('LoginService', () => {
	let service: LoginService;
	let httpMock: HttpTestingController;
	let mockUserStateService: jasmine.SpyObj<UserStateService>;

	beforeEach(() => {
		const userStateSpy = jasmine.createSpyObj('UserStateService', [
			'setUserFromToken',
			'clearUser',
		]);

		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
				{ provide: UserStateService, useValue: userStateSpy },
			],
		});

		service = TestBed.inject(LoginService);
		httpMock = TestBed.inject(HttpTestingController);
		mockUserStateService = TestBed.inject(
			UserStateService,
		) as jasmine.SpyObj<UserStateService>;
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should call login API and update user state on success', () => {
		const mockToken = 'mock-jwt-token';

		service.login('testUser', 'testPass').subscribe((res) => {
			{
				expect(res.token).toEqual(mockToken);
				expect(mockUserStateService.setUserFromToken).toHaveBeenCalledWith(
					mockToken,
				);
			}
		});

		const req = httpMock.expectOne((req) => req.url.includes('/login'));
		expect(req.request.method).toBe('POST');
		expect(req.request.headers.get('Authorization')).toContain('Basic');

		req.flush({ token: mockToken });
	});

	it('should handle login error properly', () => {
		const mockError = {
			status: 401,
			statusText: 'Unauthorized',
			error: { message: 'Invalid Credentials' },
		};

		service.login('wrongUser', 'wrongPass').subscribe({
			next: () => fail('Should have fail with 401 error'),
			error: (err) => {
				expect(err.status).toBe(401);
				expect(err.message).toBe('Incorrect username or password');
			},
		});

		const req = httpMock.expectOne((req) => req.url.includes('/login'));
		req.flush(mockError.error, {
			status: mockError.status,
			statusText: mockError.statusText,
		});
	});

	it('should handle login error if server is down', () => {
		const mockError = {
			status: 0,
			statusText: 'Unknown Error',
			error: null,
		};

		service.login('user', 'pass').subscribe({
			next: () => fail('Should have failed with a network/server error'),
			error: (err) => {
				expect(err.status).toBe(0);
				expect(err.message).toBe('System down, try again later :(');
			},
		});

		const req = httpMock.expectOne((req) => req.url.includes('/login'));
		req.flush(mockError.error, {
			status: mockError.status,
			statusText: mockError.statusText,
		});
	});

	it('should clear user on logout', () => {
		service.logout();
		expect(mockUserStateService.clearUser).toHaveBeenCalled();
	});
});
