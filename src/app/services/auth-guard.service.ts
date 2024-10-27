import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private alertController: AlertController
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const expectedRole = route.data['role'];
    const currentRole = localStorage.getItem('userRole');

    if (!this.authService.isLoggedIn()) {
      await this.showAlert('Access Denied', 'Please log in to continue.');
      await this.router.navigate(['/login'], { replaceUrl: true });
      return false;
    }

    if (expectedRole && expectedRole !== currentRole) {
      await this.showAlert('Access Denied', 'You are not authorized to access this page.');
      const dashboardRoute = currentRole === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';
      await this.router.navigate([dashboardRoute], { replaceUrl: true });
      return false;
    }

    return true;
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
