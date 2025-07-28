import {
	ApplicationConfig,
	inject,
	provideAppInitializer,
	provideBrowserGlobalErrorListeners,
	provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { UserStateService } from './core/services/state/user/user-state.service';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideHttpClient(),
		// ✅ Register APP_INITIALIZER
		provideAppInitializer(() => {
			const userState = inject(UserStateService);
			return userState.init()(); // <- Call init() to get the Promise-returning function and invoke it
		}),
	],
};
