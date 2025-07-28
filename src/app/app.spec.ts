import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavComponent } from './shared/nav.component/nav.component';
import {
	HttpClientTestingModule,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { App } from './app';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('App', () => {
	let fixture: ComponentFixture<App>;
	let component: App;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				App, // standalone component
				NavComponent, // standalone component
			],
			providers: [
				provideHttpClientTesting(),
				provideHttpClient(),
				provideRouter([]),
			],
			schemas: [NO_ERRORS_SCHEMA], // ignore unknown tags like router-outlet
		}).compileComponents();

		fixture = TestBed.createComponent(App);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create the app component', () => {
		expect(component).toBeTruthy();
	});

	it('should render the nav component', () => {
		const navEl = fixture.nativeElement.querySelector('app-nav');
		expect(navEl).toBeTruthy();
	});

	it('should render router-outlet', () => {
		const routerOutletEl =
			fixture.nativeElement.querySelector('router-outlet');
		expect(routerOutletEl).toBeTruthy();
	});
});
