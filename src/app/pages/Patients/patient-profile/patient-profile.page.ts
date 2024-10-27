import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.page.html',
  styleUrls: ['./patient-profile.page.scss'],
})
export class PatientProfilePage implements OnInit {

  currentUser: any;

  constructor(
    private afAuth: AuthenticationService,
    private alertController: AlertController,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.userService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.currentUser = user;
      }
    });
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Logout',
          handler:async () => {
          await this.afAuth.logout();
          localStorage.removeItem('userRole');
          localStorage.clear();

          }
        }
      ]
    });

    await alert.present();
  }

}