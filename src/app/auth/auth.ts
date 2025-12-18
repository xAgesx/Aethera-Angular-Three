import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FirebaseService, User } from '../services/firebase-service';
import { MainService } from '../services/main-service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  imports: [FormsModule, NgxCaptchaModule, CommonModule],
  styleUrls: ['./auth.css']
})
export class Auth {

  isLogin = true;
  captchaToken: string | null = null;
  public readonly siteKey = '6LfW0v8rAAAAADQg4SsG6OZrcyYq1IN2XqwcPKuR';

  //Password settings
  passwordVisible = false;
  password?: string;

  constructor(private router: Router, private http: HttpClient, private firebaseService: FirebaseService, public mainService: MainService) { }

  ngOnInit() {
    this.passwordVisible = false;
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

    //Handle ReCaptcha
    this.http.post(backendUrl, { recaptcha: authForm.value.recaptcha })
      .subscribe({
        next: (response: any) => {
          console.log('Backend Response:', response);
          if (response.success) {
            console.log('reCAPTCHA verified and login/signup successful!');

          } else {
            console.error('Authentication failed:', response.message);
            this.mainService.showNotification('error', "ReCAPTCHA Verification Failed");;

          }
        },
        error: (error) => {
          console.error('Network or Server Error:', error);
        }
      });

    if (!this.verifForm(authForm)) {
      return;
    }
    this.firebaseService.getUserByEmail(authForm.value.email).subscribe(data => {
      console.log('data : ', data);
      this.firebaseService.connectedUser = data[0] as User;
      console.log('ConnectedUser ', this.firebaseService.connectedUser);

      // Login 
      if (this.isLogin) {
        this.login(data, authForm);
      }
      // Signup
      else {
        this.signup(data, authForm);
      }

    });;


  }
  public verifForm(authForm: any) {
    let email = authForm.value.email;
    let password = authForm.value.password;
    //Ignore Confirm Password in Login
    if (this.isLogin) {
      authForm.value.confirmPassword = password;
    }

    if (!this.verifEmail(email)) {
      this.mainService.showNotification('error', 'Email Is Invalid');
      console.log(password.trim() != '' && (password.length < 6 || !this.containsUppercase(password)));
      return false;
    }

    else if (password.trim() != '' && !this.isLogin && (password.length < 6 || !this.containsUppercase(password))) {
      this.mainService.showNotification('error', '"Password Must Be At Least 5 Caracters Long And Must Have 1 Capital"');
      return false;

    }
    else if (password != authForm.value.confirmPassword && authForm.value.confirmPassword.trim() != '') {
      this.mainService.showNotification('error', "Password Don't Match");
      return false;
    }

    return true;
  }


  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    console.log(this.passwordVisible);
  }
  verifEmail(email: string) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  containsUppercase(str: string) {
    return /[A-Z]/.test(str);
  }
  signup(data: any, authForm: any) {
    if (data.length == 0) {
      let username = authForm.value.email?.split('@', 1)[0];
      this.firebaseService.addUser({ email: authForm.value.email, password: authForm.value.password, username: username, role: 'Member', bio: 'Nothing To See Here' });
      sessionStorage.setItem('email', authForm.value.email);
      this.mainService.showNotification('success', 'You are in ! Welcome to the community');
      this.redirectWithDelay('/browse', 2000);
    } else {
      this.mainService.showNotification('error', "User Already Registered");
    }
  }
  login(data: any, authForm: any) {
    if (data.length == 0) {
      this.mainService.showNotification('error', 'User Is Not Registered');
    } else {
      if (authForm.value.password == data[0].password) {
        this.redirectWithDelay('/browse', 2000);
        sessionStorage.setItem('email', authForm.value.email);
        this.mainService.showNotification('success', 'Welcome Back !');
      } else {
        this.mainService.showNotification('error', 'Wrong Credentials');
      }
    }

  }

  addUser(user: User) {
    this.firebaseService.addUser(user);
  }
  redirect(path: string) {
    this.router.navigate([path]);
  }
  redirectWithDelay(path: string, delay: number) {
    setTimeout(() => {
      this.router.navigate([path]);
    }, delay);
  }
}