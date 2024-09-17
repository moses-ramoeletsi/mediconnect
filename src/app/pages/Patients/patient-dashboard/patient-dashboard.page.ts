import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavController } from '@ionic/angular';
import { Observable, filter, switchMap, map } from 'rxjs';
import { UserModel } from 'src/app/model/userModel';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.page.html',
  styleUrls: ['./patient-dashboard.page.scss'],
})
export class PatientDashboardPage implements OnInit {

  categories = [
    { name: 'Psychologist', icon: 'brain-outline', color: '#4CAF50' },
    { name: 'Cardiology', icon: 'heart-outline', color: '#2196F3' },
    { name: 'Quick test', icon: 'flask-outline', color: '#FF9800' },
    { name: 'Therapist', icon: 'fitness-outline', color: '#9C27B0' },
  ];

  topDoctors = [
    {
      id: 1,
      name: 'Dr. Toke Ehigiator',
      specialty: 'Cardiologist',
      image: 'assets/doctors/toke-ehigiator.jpg',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Dr. Chinyere Yussuf',
      specialty: 'Surgeon',
      image: 'assets/doctors/chinyere-yussuf.jpg',
      rating: 4.8
    },
    // Add more doctors as needed
  ];

  onCategoryClick(category: any) {
    console.log('Category clicked:', category.name);
    // Implement navigation or other actions here
  }
  userName: string = '';
  user: Observable<UserModel | null>;
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
      map((userDetails) => userDetails as UserModel)
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
