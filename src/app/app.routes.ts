import { Routes } from '@angular/router';
import { GameDetails } from './game-details/game-details';
import { Landing } from './landing/landing';
import { Auth } from './auth/auth';
import { Layout } from './layout/layout';
import { Browse } from './browse/browse';
import { Profile } from './profile/profile';



export const routes: Routes = [

    { path: 'landing', component: Landing },
    { path: 'auth', component: Auth },
    {
        path: '', component: Layout,
        children: [
            { path: 'browse', component: Browse },
            { path: 'details/:id', component: GameDetails },
            { path : 'profile/:id',component:Profile}
        ]
    }

];

