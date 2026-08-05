import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { previewRoutes } from './app.routes.preview';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(previewRoutes),
    provideHttpClient(),
    provideCharts(withDefaultRegisterables()),
  ],
};
