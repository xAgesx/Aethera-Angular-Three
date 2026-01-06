import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { MainService } from '../services/main-service';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase-service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

  isCollapsed = false;
  showProfileDropdown = false;
  loggedUser?: string;
  loggedEmail?: string;
  role?:string = 'Member';
  userAvatar ?: any;

  constructor(private mainService: MainService, private firebaseService:FirebaseService) { }
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  ngOnInit() {

    this.loggedEmail = sessionStorage.getItem('email') ?? undefined;
    if(this.loggedEmail == undefined ) this.redirect("landing");
    this.getUsername();
    this.firebaseService.getUserInfo();
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }
  logout(){
    sessionStorage.clear();
    this.redirect("/landing");
    this.firebaseService.tempAvatarPreview.set(null);
  }
  redirect(path: string) {
    this.mainService.redirect(path);
  }
  tempAvatarView(){
        return this.firebaseService.tempAvatarPreview();
    }

  getUsername(){
    if (this.loggedEmail) {
    this.firebaseService.getUserByEmail(this.loggedEmail).subscribe((data)=>{
      this.loggedUser = data[0].username;
      });
    }
  }
}


