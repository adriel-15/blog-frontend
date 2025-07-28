import { TestBed } from '@angular/core/testing';

import { JwtClaims, JwtService } from './jwt.service';

describe('JwtService', () => {
	let service: JwtService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(JwtService);
	});

	it('should decode a valid JWT token', () => {
		// {
		// 	"profileName": "adriel15@",
		// 	"sub": "rosario123",
		// 	"iss": "self",
		// 	"exp": 1753394039,
		// 	"iat": 1753393739,
		// 	"userId": 1,
		// 	"authorities": "ROLE_WRITER ROLE_READER ROLE_ADMIN"
		//  }
		// This is a valid, unsigned JWT just for testing (base64 only, no signature check)
		const token =
			'eyJhbGciOiJSUzI1NiJ9.eyJwcm9maWxlTmFtZSI6ImFkcmllbDE1QCIsInN' +
			'1YiI6InJvc2FyaW8xMjMiLCJpc3MiOiJzZWxmIiwiZXhwIjoxNzUzMzk0MDM5' +
			'LCJpYXQiOjE3NTMzOTM3MzksInVzZXJJZCI6MSwiYXV0aG9yaXRpZXMiOiJST0x' +
			'FX1dSSVRFUiBST0xFX1JFQURFUiBST0xFX0FETUlOIn0.jCkLlw46dCIEzFck9' +
			'42tBSNi5oJASadma3fIQNsuIvs7u_mSg5EpbXq1sbyMUF9B76WWtDIM29InEuU77I' +
			'YLgKeRgL5tpqi87qIiDE24HWdX_2yIP4QVGBmb7iQgmDOMUe-ZMMMenilzCvT7Wl' +
			'vYmd3JHBv4qxTQoW5PkkCyLlfFus8wDWOrGA6aheNDwbX5V5ZFfo21rWED2sKiXO' +
			'ZeWIV4wEntnyXr23KmaCptZxEmXGjAF91wCExmZ0-sB_xVcmI-6k6cXEYKmodD6uR' +
			'ga8S2ADvKpSN6iCyNg-kU90N-HJsdvyM4HZZIfIwjQVJdDc08sbTA0WOSmu5qrKHzTA';

		const result: JwtClaims = service.decode(token);

		expect(result.sub).toBe('rosario123');
		expect(result.userId).toBe(1);
		expect(result.authorities).toBe('ROLE_WRITER ROLE_READER ROLE_ADMIN');
		expect(result.profileName).toBe('adriel15@');
	});
});
