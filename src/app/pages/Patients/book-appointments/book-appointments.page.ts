import { Component, OnInit, ViewChild } from '@angular/core';
import {
  NavController,
  ModalController,
  IonModal,
  AlertController,
} from '@ionic/angular';
import { BehaviorSubject, filter, map, Observable, of, switchMap } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentsService } from 'src/app/services/appointments.service';
import { UserService } from 'src/app/services/user.service';
import { UserModel } from 'src/app/model/userModel';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-book-appointments',
  templateUrl: './book-appointments.page.html',
  styleUrls: ['./book-appointments.page.scss'],
})
export class BookAppointmentsPage implements OnInit {
  @ViewChild(IonModal)
  modal!: IonModal;
  appointments = {
    uid:'',
    doctorId: '',
    doctorName: '',
    specialty: '',
    patientId: '',
    patientName: '',
    patientPhone: '',
    status: 'pending',
  };

  doctors$: Observable<any[]>;
  appointmentForm: FormGroup;
  selectedDoctor: any;
  currentUser: any;
  userAppointments: any[] = [];
  user: Observable<UserModel | null>;
  uid: string = '';
  
  constructor(
    private navCtrl: NavController,
    private userService: UserService,
    private userAuth: AngularFireAuth,
    private alertController: AlertController,
    private appointmentsService: AppointmentsService,
    private fb: FormBuilder
  ) {
    this.doctors$ = this.userService.getDoctors(); 

    this.appointmentForm = this.fb.group({
      date_and_time: ['', Validators.required],
      purpose: ['', Validators.required],
    });
  
    this.user = this.userAuth.authState.pipe(
      filter((user) => user !== null),  
      switchMap((user) => {
        return this.userService.getUserDetails(user?.uid);  
      }),
      map((userDetails) => userDetails as UserModel)
    );
  
    this.user.subscribe((userDetails) => {
      if (userDetails) {
        this.loadUserAppointments(userDetails.uid); 
      }
    });
  }

  loadUserAppointments(uid: string) {
    this.appointmentsService
      .getAppointmentsForUser(uid) 
      .subscribe((userAppointments) => {
        this.userAppointments = userAppointments;
      });
  }
  
  ngOnInit() {
    this.userService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
      this.loadUserAppointments(user.uid); 
    });
  }

  openDoctorDetails(doctorId: string) {
    this.navCtrl.navigateForward(`/doctor-details/${doctorId}`);
  }

  openBookingModal(doctor: any) {
    this.selectedDoctor = doctor;
    this.modal.present();
  }

  dismissModal() {
    this.modal.dismiss();
    this.appointmentForm.reset();
  }

  bookAppointment() {
    if (this.appointmentForm.valid && this.currentUser && this.selectedDoctor) {
      const appointmentData = {
        ...this.appointmentForm.value,
        doctorId: this.selectedDoctor.id,
        doctorName: this.selectedDoctor.name,
        specialty: this.selectedDoctor.specialty,
        patientId: this.currentUser.uid,
        patientName: this.currentUser.name,
        patientPhone: this.currentUser.phoneNumber,
        status: 'pending',
      };
  
      this.appointmentsService.createAppointment(appointmentData)
        .then(() => {
          this.dismissModal(); 
          this.showAlert('Success', 'Appointment booked successfully');
          this.loadUserAppointments(this.currentUser.uid); 
        })
        .catch((error) => {
          this.showAlert('Error', 'Error booking appointment: ' + error.message);
        });
    }
  }
  
  getFormattedDateTime(dateTimeStr: string): { date: string; time: string } {
    const dateTime = new Date(dateTimeStr);
    const year = dateTime.getFullYear();
    const month = dateTime.getMonth() + 1;
    const date = dateTime.getDate();
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();

    const formattedDate = `${year}-${month}-${date}`;
    const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

    return { date: formattedDate, time: formattedTime };
  }
  getAppointmentStatusColor(status: string): string {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'completed':
        return 'primary'; 
      default:
        return 'warning';
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
