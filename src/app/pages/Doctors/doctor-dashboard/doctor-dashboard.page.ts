import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavController } from '@ionic/angular';
import { Observable, filter, switchMap, map } from 'rxjs';
import { doctorModel, UserModel } from 'src/app/model/userModel';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.page.html',
  styleUrls: ['./doctor-dashboard.page.scss'],
})
export class DoctorDashboardPage implements OnInit {

  userName: string = '';
  user: Observable<doctorModel | null>;
  constructor(
    private navCtrl: NavController,
    public fireServices: UserService,
    public afAuth: AngularFireAuth
  ) {
    this.user = this.afAuth.authState.pipe(
      filter((user) => user !== null),
      switchMap((user) => {
        return this.fireServices.getUserDetails(user);
      }),
      map((userDetails) => userDetails as doctorModel)
    );

    this.user.subscribe((userDetails) => {
      if (userDetails) {
        this.userName = userDetails.name;
      }
    });
  }
  ngOnInit() {
  }

  openChat() {
    this.navCtrl.navigateForward('/chats');
  }

}
