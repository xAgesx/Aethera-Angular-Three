import { Routes } from '@angular/router';
import { GameDetails } from './game-details/game-details';
import { Landing } from './landing/landing';
import { Auth } from './auth/auth';
import { Layout } from './layout/layout';
import { Browse } from './browse/browse';
import { Profile } from './profile/profile';
import { Dashboard } from './dashboard/dashboard';
import { VoidDash } from './dash-game/dash-game';




export const routes: Routes = [
    { path: 'landing', component: Landing },
    { path: 'auth', component: Auth },
    {
        path: '', component: Layout,
        children: [
            { path: 'browse', component: Browse },
            { path: 'details/:id', component: GameDetails },
            { path: 'profile/:id', component: Profile },
            { path: 'dashboard', component: Dashboard }
            
        ]
    },
    { path: 'dashGame', component: VoidDash },
    { path: '**', component: Landing }


];

