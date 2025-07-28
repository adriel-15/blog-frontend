import { computed, Injectable, signal } from '@angular/core';
import { User } from '../../../models/user.model';
import { JwtService } from '../../util/jwt/jwt.service';

@Injectable({
	providedIn: 'root',
})
export class UserStateService {
	private readonly _user = signal<User | null>(null);
	readonly user = this._user.asReadonly();
	readonly isLoggedIn = computed(() => !!this._user());

	constructor(private readonly jwtService: JwtService) {}

	setUserFromToken(token: string) {
		const claims = this.jwtService.decode(token);
		this._user.set({
			username: claims.sub,
			userId: claims.userId,
			roles: claims.authorities.split(' '),
			exp: claims.exp,
			profileName: claims.profileName,
		});
		localStorage.setItem('access_token', token);
	}

	clearUser() {
		localStorage.removeItem('access_token');
		this._user.set(null);
	}

	restoreFromStorage() {
		const token = localStorage.getItem('access_token');
		if (!token) return;

		const claims = this.jwtService.decode(token);
		if (claims.exp > Date.now() / 1000) {
			this._user.set({
				username: claims.sub,
				userId: claims.userId,
				roles: claims.authorities.split(' '),
				exp: claims.exp,
				profileName: claims.profileName,
			});
		} else {
			this.clearUser();
		}
	}

	hasRole(role: string): boolean {
		const user = this._user();
		return user ? user.roles.includes(role) : false;
	}

	hasAnyRole(roles: string[]): boolean {
		const user = this._user();
		return user ? roles.some((role) => user.roles.includes(role)) : false;
	}

	getInitials() {
		return this._user()?.profileName.charAt(0).toUpperCase();
	}

	// ✅ Add this method for APP_INITIALIZER
	init(): () => Promise<void> {
		return () =>
			new Promise((resolve) => {
				this.restoreFromStorage();
				resolve();
			});
	}
}
