import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavComponent } from './nav.component';
import { LoginService } from '../../core/services/api/login/login.service';
import { UserStateService } from '../../core/services/state/user/user-state.service';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('NavComponent', () => {
	let component: NavComponent;
	let fixture: ComponentFixture<NavComponent>;
	let loginServiceSpy: jasmine.SpyObj<LoginService>;

	// Mock signals
	const isLoggedInSignal = signal(true);
	const userRolesSignal = signal(['ROLE_READER', 'ROLE_WRITER', 'ROLE_ADMIN']);

	// Mock service
	const userStateStub: Partial<UserStateService> = {
		isLoggedIn: isLoggedInSignal,
		getInitials: () => 'AR',
		hasRole: (role: string) => userRolesSignal().includes(role),
	};

	beforeEach(async () => {
		loginServiceSpy = jasmine.createSpyObj('LoginService', ['logout']);

		await TestBed.configureTestingModule({
			imports: [NavComponent],
			providers: [
				{ provide: LoginService, useValue: loginServiceSpy },
				{ provide: UserStateService, useValue: userStateStub },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(NavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should toggle menu and close profile menu', () => {
		component.isProfileMenuOpen.set(true);
		component.toggleMenu();
		expect(component.isMenuOpen()).toBeTrue();
		expect(component.isProfileMenuOpen()).toBeFalse();
	});

	it('should toggle profile menu and close main menu', () => {
		component.isMenuOpen.set(true);
		component.toggleProfileMenu();
		expect(component.isProfileMenuOpen()).toBeTrue();
		expect(component.isMenuOpen()).toBeFalse();
	});

	it('should call loginService.logout and close menus on logout', () => {
		component.isMenuOpen.set(true);
		component.isProfileMenuOpen.set(true);
		component.logout();
		expect(component.isMenuOpen()).toBeFalse();
		expect(component.isProfileMenuOpen()).toBeFalse();
		expect(loginServiceSpy.logout).toHaveBeenCalled();
	});

	it('should show correct menu options based on roles', () => {
		fixture.detectChanges();
		const options = fixture.debugElement.queryAll(By.css('.menu-option'));
		const texts = options.map((el) => el.nativeElement.textContent.trim());
		expect(texts).toContain('Saved Posts');
		expect(texts).toContain('My Posts');
		expect(texts).toContain('Manage Application');
	});

	it('should display profile initials if user is logged in', () => {
		// Make sure the user is logged in
		isLoggedInSignal.set(true);
		fixture.detectChanges();

		const profileEl = fixture.debugElement.query(
			By.css('.profile-container p'),
		);
		expect(profileEl)
			.withContext('profile element should exist')
			.not.toBeNull();

		const text = profileEl!.nativeElement.textContent.trim();
		expect(text).toBe('AR');
	});

	it('should show login button when user is logged out', () => {
		isLoggedInSignal.set(false);
		fixture.detectChanges();

		const loginButton = fixture.debugElement.query(
			By.css('.btn.btn-primary'),
		);
		expect(loginButton).toBeTruthy();
		expect(loginButton.nativeElement.textContent.trim()).toBe('Log in');
	});

	it('should close menus when clicking outside component', () => {
		spyOn(component, 'closeMenus');

		// Create a click event with target outside the component nativeElement
		const outsideElement = document.createElement('div');
		document.body.appendChild(outsideElement); // attach to DOM to be realistic

		const event = new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
		});
		Object.defineProperty(event, 'target', { value: outsideElement });

		component.handleClickOutside(event);

		expect(component.closeMenus).toHaveBeenCalled();

		document.body.removeChild(outsideElement); // cleanup
	});

	it('should not close menus when clicking inside component', () => {
		spyOn(component, 'closeMenus');

		const nativeElement = component['elRef'].nativeElement as HTMLElement;

		// Create a child element inside the nativeElement
		const insideElement = document.createElement('div');
		nativeElement.appendChild(insideElement);

		// Create a click event with target inside the component nativeElement
		const event = new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
		});
		Object.defineProperty(event, 'target', { value: insideElement });

		component.handleClickOutside(event);

		expect(component.closeMenus).not.toHaveBeenCalled();

		nativeElement.removeChild(insideElement); // cleanup
	});
});
