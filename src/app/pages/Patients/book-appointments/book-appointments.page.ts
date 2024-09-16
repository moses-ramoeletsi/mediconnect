import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-book-appointments',
  templateUrl: './book-appointments.page.html',
  styleUrls: ['./book-appointments.page.scss'],
})
export class BookAppointmentsPage implements OnInit {

  doctors = [
    { id: 1, name: 'Dr. Toke Ehigiator', specialty: 'Cardiologist', image: 'assets/doctors/toke-ehigiator.jpg' },
    { id: 2, name: 'Dr. Adedayo Atanda', specialty: 'Cardiologist', image: 'assets/doctors/adedayo-atanda.jpg' },
    { id: 3, name: 'Dr. Yakubu Motalo', specialty: 'Cardiologist', image: 'assets/doctors/yakubu-motalo.jpg' },
    { id: 4, name: 'Dr. Ayebatari Mutiat', specialty: 'Cardiologist', image: 'assets/doctors/ayebatari-mutiat.jpg' },
    { id: 5, name: 'Dr. Chinyere Yussuf', specialty: 'Cardiologist', image: 'assets/doctors/chinyere-yussuf.jpg' },
    { id: 6, name: 'Dr. Toke Ehigiator', specialty: 'Cardiologist', image: 'assets/doctors/toke-ehigiator.jpg' },
  ];

  constructor(private navCtrl: NavController) {}

  ngOnInit() {}

  openDoctorDetails(doctorId: number) {
    this.navCtrl.navigateForward(`/doctor-details/${doctorId}`);
  }

  bookAppointment(doctorId: number) {
    console.log(`Booking appointment with doctor ID: ${doctorId}`);
    // Implement appointment booking logic
  }

}
