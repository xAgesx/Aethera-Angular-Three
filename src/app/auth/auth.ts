import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FirebaseService, User } from '../services/firebase-service';
import { pass } from 'three/tsl';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  imports: [FormsModule, NgxCaptchaModule, CommonModule],
  styleUrls: ['./auth.css']
})
export class Auth {
  errorMessage = '';
  isLogin = true;
  captchaToken: string | null = null;
  public readonly siteKey = '6LfW0v8rAAAAADQg4SsG6OZrcyYq1IN2XqwcPKuR';

  constructor(private router: Router, private http: HttpClient, private firebaseService: FirebaseService) { }

  ngOnInit() {

    (window as any)['handleGoogleCredentialResponse'] =
      this.handleGoogleCredentialResponse.bind(this);
  }


  handleGoogleCredentialResponse(response: any): void {
    if (response.credential) {
      const idToken = response.credential;
      const backendUrl = 'http://localhost/Backend/google-callback.php';

      this.http.post(backendUrl, { id_token: idToken })
        .subscribe({
          next: (res: any) => {
            if (res.success) {
              console.log('Google login verified and successful!', res.user);
              this.router.navigate(['/layout']);
            } else {
              console.error('Google verification failed:', res.message);
            }
          },
          error: (err) => {
            console.error('Network or Server Error during Google verification.', err);
          }
        });
    }
  }

  handleCaptchaResponse(token: string) {
    this.captchaToken = token;
    console.log('reCAPTCHA Token received:', token);
  }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(authForm: NgForm) {

    if (authForm.invalid) {
      console.log('Form is invalid (reCAPTCHA not checked or fields empty).');
      return;
    }

    const backendUrl = 'http://localhost/Backend/verify_recaptcha.php';

    this.http.post(backendUrl, { recaptcha: authForm.value.recaptcha })
      .subscribe({
        next: (response: any) => {
          console.log('Backend Response:', response);
          if (response.success) {
            console.log('reCAPTCHA verified and login/signup successful!');

          } else {
            console.error('Authentication failed:', response.message);
            this.errorMessage = "ReCAPTCHA Verification Failed";

          }
        },
        error: (error) => {
          console.error('Network or Server Error:', error);
        }
      });


    this.firebaseService.getUserByEmail(authForm.value.email).subscribe(data => {
      console.log('data', data);
      if (this.isLogin) {
        if (data.length == 0) {
          this.errorMessage = 'User Not Registered';
        } else {
          this.redirect('/browse');
        }
      } else {
        if(data.length == 0 ){
          this.firebaseService.addUser({email : authForm.value.email,password : authForm.value.password});
          sessionStorage.setItem('email',authForm.value.email);
          this.redirect('/browse');
        }
      }

    });;


  }

  addUser(user: User) {
    this.firebaseService.addUser(user);
  }
  redirect(path: string) {
    this.router.navigate([path]);
  }
}