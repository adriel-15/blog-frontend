import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserStateService } from '../../state/user/user-state.service';
import { catchError, tap, throwError } from 'rxjs';

export interface JwtDto {
	token: string;
}

@Injectable({
	providedIn: 'root',
})
export class LoginService {
	private readonly loginUrl = `${environment.apiBaseUrl}/login`;

	constructor(
		private readonly http: HttpClient,
		private readonly userState: UserStateService,
	) {}

	login(username: string, password: string) {
		const headers = new HttpHeaders({
			Authorization: 'Basic ' + btoa(`${username}:${password}`),
		});
		return this.http.post<JwtDto>(this.loginUrl, {}, { headers }).pipe(
			tap((res) => {
				this.userState.setUserFromToken(res.token);
			}),
			catchError((error) => {
				// Extract meaningful info
				const status = error.status;

				const message =
					error.status !== 0
						? 'Incorrect username or password'
						: 'System down, try again later :(';

				return throwError(() => ({
					status,
					message,
				}));
			}),
		);
	}

	logout() {
		this.userState.clearUser();
	}
}
