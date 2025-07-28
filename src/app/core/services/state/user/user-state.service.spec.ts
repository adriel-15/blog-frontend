import { TestBed } from '@angular/core/testing';

import { UserStateService } from './user-state.service';
import { JwtClaims, JwtService } from '../../util/jwt/jwt.service';

describe('UserStateService', () => {
	let service: UserStateService;
	let jwtServiceSpy: jasmine.SpyObj<JwtService>;

	const fakeToken = 'mock-jwt-token';

	const mockClaims: JwtClaims = {
		iss: 'issuer',
		sub: 'john_doe',
		exp: Math.floor(Date.now() / 1000) + 3600,
		iat: Math.floor(Date.now() / 1000),
		userId: 1,
		authorities: 'ROLE_ADMIN ROLE_WRITER ROLE_READER',
		profileName: 'Johny Doe',
	};

	beforeEach(() => {
		localStorage.clear();

		const spy = jasmine.createSpyObj('JwtService', ['decode']);
		spy.decode.and.returnValue(mockClaims);

		TestBed.configureTestingModule({
			providers: [{ provide: JwtService, useValue: spy }],
		});

		service = TestBed.inject(UserStateService);
		jwtServiceSpy = TestBed.inject(JwtService) as jasmine.SpyObj<JwtService>;
	});

	it('should set user from token and store it in localStorage', () => {
		service.setUserFromToken(fakeToken);

		expect(jwtServiceSpy.decode).toHaveBeenCalledWith(fakeToken);
		const user = service.user();
		expect(user?.username).toBe('john_doe');
		expect(user?.roles).toEqual(['ROLE_ADMIN', 'ROLE_WRITER', 'ROLE_READER']);
		expect(localStorage.getItem('access_token')).toBe(fakeToken);
	});

	it('should clear user and remove token', () => {
		service.setUserFromToken(fakeToken);
		service.clearUser();

		expect(service.user()).toBeNull();
		expect(localStorage.getItem('access_token')).toBeNull();
	});

	it('should restore user from valid token in localStorage', () => {
		localStorage.setItem('access_token', fakeToken);
		service.restoreFromStorage();

		expect(jwtServiceSpy.decode).toHaveBeenCalledWith(fakeToken);
		expect(service.user()?.username).toBe('john_doe');
	});

	it('should do nothing if no token is found in localStorage', () => {
		spyOn(localStorage, 'getItem').and.returnValue(null);

		const clearUserSpy = spyOn(service, 'clearUser');

		service.restoreFromStorage();

		expect(clearUserSpy).not.toHaveBeenCalled();
	});

	it('should clear expired token from storage', () => {
		jwtServiceSpy.decode.and.returnValue({
			...mockClaims,
			exp: Math.floor(Date.now() / 1000) - 100, // expired
		});

		localStorage.setItem('access_token', fakeToken);
		service.restoreFromStorage();

		expect(service.user()).toBeNull();
		expect(localStorage.getItem('access_token')).toBeNull();
	});

	it('should correctly detect user roles', () => {
		service.setUserFromToken(fakeToken);
		expect(service.hasRole('ROLE_ADMIN')).toBeTrue();
		expect(service.hasRole('ROLE_WRITER')).toBeTrue();
		expect(service.hasRole('ROLE_READER')).toBeTrue();
	});

	it('should check if user has any role from a list', () => {
		service.setUserFromToken(fakeToken);
		expect(service.hasAnyRole(['ROLE_ADMIN', 'WRITER'])).toBeTrue();
		expect(service.hasAnyRole(['READER'])).toBeFalse();
	});

	it('should return false if user signal is null', () => {
		service.clearUser();
		expect(service.hasAnyRole(['ROLE_ADMIN'])).toBeFalse();
	});

	it('should get capitalized initial from profileName', () => {
		service.setUserFromToken(fakeToken);
		expect(service.getInitials()).toBe('J');
	});

	it('should return undefined for initials when user is null', () => {
		expect(service.getInitials()).toBeUndefined();
	});

	it('should initialize and restore from storage', async () => {
		localStorage.setItem('access_token', fakeToken);
		await service.init()();
		expect(service.user()?.username).toBe('john_doe');
	});
});
