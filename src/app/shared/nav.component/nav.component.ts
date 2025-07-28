import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, signal } from '@angular/core';
import { UserStateService } from '../../core/services/state/user/user-state.service';
import { LoginComponent } from '../../features/login.component/login.component';
import { LoginService } from '../../core/services/api/login/login.service';
import { ModalComponent } from '../modal.component/modal.component';

@Component({
	selector: 'app-nav',
	imports: [CommonModule, ModalComponent, LoginComponent],
	templateUrl: './nav.component.html',
	styleUrl: './nav.component.css',
})
export class NavComponent {
	isMenuOpen = signal(false);
	isProfileMenuOpen = signal(false);
	isLoginModalOpen = signal(false);

	constructor(
		private elRef: ElementRef,
		public userState: UserStateService,
		private loginService: LoginService,
	) {}

	logout() {
		this.closeMenus();
		this.loginService.logout();
	}

	toggleMenu() {
		// Close profile menu if opening main menu
		if (!this.isMenuOpen()) {
			this.isProfileMenuOpen.set(false);
		}
		this.isMenuOpen.update((val) => !val);
	}

	toggleProfileMenu() {
		// Close main menu if opening profile menu
		if (!this.isProfileMenuOpen()) {
			this.isMenuOpen.set(false);
		}
		this.isProfileMenuOpen.update((val) => !val);
	}

	closeMenus() {
		this.isMenuOpen.set(false);
		this.isProfileMenuOpen.set(false);
	}

	@HostListener('document:click', ['$event'])
	handleClickOutside(event: MouseEvent) {
		const clickedInside = this.elRef.nativeElement.contains(event.target);
		if (!clickedInside) {
			this.closeMenus();
		}
	}
}
