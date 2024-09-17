import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-doc-profile',
  templateUrl: './doc-profile.page.html',
  styleUrls: ['./doc-profile.page.scss'],
})
export class DocProfilePage implements OnInit {

  currentUser: any;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
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

  logout() {
    this.presentLogoutAlert();
  }

  async presentLogoutAlert() {
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
          handler: () => {
            this.afAuth.signOut().then(() => {
              localStorage.clear();
              sessionStorage.clear();
              this.router.navigate(['/login']);
            });
          }
        }
      ]
    });

    await alert.present();
  }
}
