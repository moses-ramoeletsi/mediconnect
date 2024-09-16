import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-doctor-details',
  templateUrl: './doctor-details.page.html',
  styleUrls: ['./doctor-details.page.scss'],
})
export class DoctorDetailsPage implements OnInit {

  doctor: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // In a real app, you'd fetch the doctor details from a service
    // using the ID from the route params
    const id = this.route.snapshot.paramMap.get('id');
    this.doctor = {
      id: id,
      name: 'Dr. Toke Ehigiator',
      specialty: 'Cardiologist',
      hospital: 'African Hospital',
      image: 'assets/doctors/toke-ehigiator.jpg',
      rating: 4.8,
      reviews: 122,
      patients: '1000+',
      experience: '8 yr+',
      about: 'Toke is a dedicated cardiologist known for his expertise in diagnosing and treating heart conditions. With over 8 years of experience, he has helped numerous patients improve their cardiovascular health.',
      workingTime: 'Mon - Sat (08:30 AM - 09:00 PM)',
    };
  }

  bookAppointment() {
    console.log('Booking appointment...');
    // Implement appointment booking logic
  }
}
