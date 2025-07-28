import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

export interface JwtClaims {
	iss: string;
	sub: string;
	exp: number;
	iat: number;
	userId: number;
	authorities: string;
	profileName: string;
}

@Injectable({
	providedIn: 'root',
})
export class JwtService {
	constructor() {}

	decode(token: string): JwtClaims {
		return jwtDecode<JwtClaims>(token);
	}
}
