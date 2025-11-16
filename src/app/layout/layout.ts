import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { MainService } from '../services/main-service';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet,CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

  isCollapsed = false;
  showProfileDropdown = false;
  loggedUser ?: string ;


  constructor(private mainService : MainService){}
    toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.loggedUser = sessionStorage.getItem('email') ?? undefined;
  }


toggleProfileDropdown() {
  this.showProfileDropdown = !this.showProfileDropdown;
}
  redirect(path : string){
    this.mainService.redirect(path);
  }
}


