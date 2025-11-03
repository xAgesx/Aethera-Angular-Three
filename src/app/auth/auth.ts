import { AfterViewInit, Component, OnInit } from '@angular/core'; 
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
export class Auth implements AfterViewInit { 
  isLogin = true;
  captchaToken: string | null = null;
  public readonly siteKey = '6LfW0v8rAAAAADQg4SsG6OZrcyYq1IN2XqwcPKuR';

  constructor(private router: Router, private http: HttpClient) { }

  ngAfterViewInit() {
  
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
  
  // signInWithGoogle() is now unused as Google handles the click directly
}