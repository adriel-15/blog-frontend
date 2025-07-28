import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { LoginService } from '../../core/services/api/login/login.service';

@Component({
	selector: 'app-login',
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css',
})
export class LoginComponent {
	@Output() closed = new EventEmitter<void>();

	form: FormGroup;

	isLoginFailOpen = signal(false);
	LoginFailMessage = signal('');

	constructor(
		private loginService: LoginService,
		private fb: FormBuilder,
	) {
		this.form = this.fb.group({
			username: ['', Validators.required],
			password: ['', Validators.required],
		});
	}

	submit() {
		if (this.form.valid) {
			const { username, password } = this.form.value;

			this.loginService.login(username, password).subscribe({
				next: () => {
					console.log('Logged in!');
					this.close();
				},
				error: (err) => {
					console.log(err);
					this.isLoginFailOpen.set(true);
					this.LoginFailMessage.set(err.message);
				},
			});
		}
	}

	close() {
		this.closed.emit();
	}
}
