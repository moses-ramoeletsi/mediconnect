import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

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
  constructor( private navCtrl: NavController,) { }

  ngOnInit() {
  }
  openChat() {
    this.navCtrl.navigateForward('/chats');
  }

}
