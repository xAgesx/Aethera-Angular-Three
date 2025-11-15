import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyD4gv6DZlZBQdn_Zme_ZPewkoZDcxGXOnk",
      authDomain: "tpfirebase-3814c.firebaseapp.com",
      projectId: "tpfirebase-3814c",
      storageBucket: "tpfirebase-3814c.firebasestorage.app",
      messagingSenderId: "493981537742",
      appId: "1:493981537742:web:ee6341aeb77680f36f079f"
    })),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ]
};
