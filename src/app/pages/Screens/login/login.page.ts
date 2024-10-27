import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
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
  isLoading = false;

  constructor(
    private authService: AuthenticationService,
    public fireServices: UserService,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public router: Router
  ) {
    this.logoutSubscription = this.authService.getLogoutObservable().subscribe(() => {
      this.resetForm();
    });
  }

  ngOnInit(): void {
    localStorage.clear();
    sessionStorage.clear();
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

  async login() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      try {
        const userLogin = this.loginForm.value;
        const userCredential = await this.authService.login(userLogin);
        
        this.fireServices.getUserDetails(userCredential.user).subscribe(
          async (userData: any) => {
            if (userData && Object.keys(userData).length !== 0) {
              await this.authService.setUserRole(userData.userType);
            } else {
              await this.showAlert('Error', 'User data not found');
              await this.authService.logout();
            }
            this.isLoading = false;
          },
          async (error) => {
            this.isLoading = false;
            await this.showAlert('Error', 'Failed to get user details');
            await this.authService.logout();
          }
        );
      } catch (error: any) {
        this.isLoading = false;
        await this.showAlert('Login Error', error.message);
      }
    } else {
      await this.showAlert('Form Error', 'Please check the form fields.');
    }
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}