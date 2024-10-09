import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  private logoutSubscription: Subscription;

  constructor(
    private authService: AuthenticationService,
    public fireServices: UserService,
    public alertController: AlertController,
    public router: Router
  ) {
    this.logoutSubscription = this.authService.getLogoutObservable().subscribe(() => {
      this.resetForm();
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
    }
  }

  private initForm(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/[a-zA-Z0-9@_\-!]+/),
      ]),
    });
  }

  private resetForm(): void {
    if (this.loginForm) {
      this.loginForm.reset();
    }
  }

  login() {
    if (this.loginForm.valid) {
      const userLogin = this.loginForm.value;
      this.authService.login(userLogin).then(
        (userCredential) => {
          this.fireServices.getUserDetails(userCredential.user).subscribe((userData: any) => {
            if (userData && Object.keys(userData).length !== 0) {
              if (userData.userType === 'doctor') {
                this.router.navigate(['/doctor-dashboard']);
              } else {
                this.router.navigate(['/patient-dashboard']);
              }
            }
          });
        },
        (error) => {
          this.showAlert('Login Error', error.message);
        }
      );
    } else {
      this.showAlert('Form Error', 'Please check the form fields.');
    }
  }

  showAlert(title: string, message: string) {
    this.alertController
      .create({
        header: title,
        message: message,
        buttons: ['OK'],
      })
      .then((alert) => alert.present());
  }
}
