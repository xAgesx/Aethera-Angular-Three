import { Routes } from '@angular/router';
import { GameDetails } from './game-details/game-details';
import { Landing } from './landing/landing';
import { Auth } from './auth/auth';
import { Layout } from './layout/layout';



export const routes: Routes = [

    {path:'landing', component:Landing},
    {path: 'auth',component:Auth},
    {path:'layout',component:Layout}
    
];

