import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import {
  provideLucideIcons,
  LucideArchive,
  LucideArchiveRestore,
  LucideBell,
  LucideCalendar,
  LucideCar,
  LucideCircleHelp,
  LucideEye,
  LucideGauge,
  LucideIndianRupee,
  LucideLayoutDashboard,
  LucideLock,
  LucideLogOut,
  LucideMail,
  LucidePencil,
  LucidePlus,
  LucideSearch,
  LucideSettings,
  LucideTrash2,
  LucideTriangleAlert,
  LucideWrench,
  LucideX,
} from '@lucide/angular';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideCharts(withDefaultRegisterables()),
    provideBrowserGlobalErrorListeners(),
    provideLucideIcons(
      LucideArchive,
      LucideArchiveRestore,
      LucideBell,
      LucideCalendar,
      LucideCar,
      LucideCircleHelp,
      LucideEye,
      LucideGauge,
      LucideIndianRupee,
      LucideLayoutDashboard,
      LucideLock,
      LucideLogOut,
      LucideMail,
      LucidePencil,
      LucidePlus,
      LucideSearch,
      LucideSettings,
      LucideTrash2,
      LucideTriangleAlert,
      LucideWrench,
      LucideX,
    ),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
