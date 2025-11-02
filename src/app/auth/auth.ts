import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxCaptchaModule } from 'ngx-captcha';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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

  // 2. Inject HttpClient
  constructor(private router: Router, private http: HttpClient) { }

  toggleAuthMode() {
    this.isLogin = !this.isLogin;
  }

  onSubmit(authForm: NgForm) {
    if (authForm.invalid) {
      console.log('Form is invalid (reCAPTCHA not checked or fields empty).');
      return;
    }


    const backendUrl = 'http://localhost/Backend/verify_recaptcha.php';

    this.http.post(backendUrl, authForm.value)
      .subscribe({
        next: (response: any) => {
          console.log('Backend Response:', response);
          if (response.success) {
            console.log('reCAPTCHA verified and login/signup successful!');
            this.router.navigate(['/layout']); 
          } else {
            console.error('Authentication failed:', response.message);

          }
        },
        error: (error) => {
          console.error('Network or Server Error:', error);

        }
      });
  }

  redirect(path: string) {
    this.router.navigate([path]);
  }
  signInWithGoogle() {

    console.log('Google Sign-In triggered');
  }
}