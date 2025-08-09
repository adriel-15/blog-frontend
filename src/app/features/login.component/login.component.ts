import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	Validators,
} from '@angular/forms';
import { LoginService } from '../../core/services/api/login/login.service';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
	selector: 'app-login',
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
	@Output() closed = new EventEmitter<void>();

	form: FormGroup;
	private tokenClient: any;

	isLoginFailOpen = signal(false);
	LoginFailMessage = signal('');

	constructor(
		private readonly loginService: LoginService,
		private readonly fb: FormBuilder,
	) {
		this.form = this.fb.group({
			username: ['', Validators.required],
			password: ['', Validators.required],
		});
	}

	ngOnInit(): void {
		this.tokenClient = google.accounts.oauth2.initTokenClient({
			client_id: environment.googleClientId,
			scope: 'email profile openid',
			callback: (response: any) => this.handleGoogleCredential(response),
		});
	}

	submit() {
		if (this.form.valid) {
			const { username, password } = this.form.value;

			this.loginService.login(username, password).subscribe({
				next: () => {
					if (!environment.production) {
						console.log('Logged in!');
					}
					this.close();
				},
				error: (err) => {
					if (!environment.production){
						console.log(err);
					} 
					this.isLoginFailOpen.set(true);
					this.LoginFailMessage.set(err.message);
				},
			});
		}
	}

	handleGoogleCredential(response: any) {
		const idToken = response.access_token;

		if (!environment.production) {
			console.log({ googleAccessToken: idToken });
		}
			
		this.loginService.googleLogin(idToken).subscribe({
			next: () => {
				if (!environment.production) {
					console.log('Google login successful');
				}
				this.close();
			},
			error: (err) => {
				console.error(err);
				this.isLoginFailOpen.set(true);
				this.LoginFailMessage.set(err.message);
			},
		});
	}

	onGoogleLoginClick() {
		this.tokenClient.requestAccessToken();
	}

	close() {
		this.closed.emit();
	}
}
