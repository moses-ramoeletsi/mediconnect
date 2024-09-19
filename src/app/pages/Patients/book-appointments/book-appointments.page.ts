
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, IonModal, AlertController } from '@ionic/angular';
import { BehaviorSubject, filter, map, Observable, switchMap } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentsService } from 'src/app/services/appointments.service';
import { UserService } from 'src/app/services/user.service';
import { UserModel } from 'src/app/model/userModel';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-book-appointments',
  templateUrl: './book-appointments.page.html',
  styleUrls: ['./book-appointments.page.scss'],
})
export class BookAppointmentsPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  @ViewChild('reminderModal')  reminderModal!: IonModal;

  doctors$: Observable<any[]>;
  appointmentForm: FormGroup;
  reminderForm: FormGroup;
  selectedDoctor: any;
  currentUser: any;
  userAppointments: any[] = [];
  user: Observable<UserModel | null>;
  uid: string = '';
  selectedAppointment: any;

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

    this.reminderForm = this.fb.group({
      reminderTime: ['', Validators.required],
    });

    this.user = this.userAuth.authState.pipe(
      filter((user) => user !== null),  
      switchMap((user) => this.userService.getUserDetails(user?.uid)),
      map((userDetails) => userDetails as UserModel)
    );

    this.user.subscribe((userDetails) => {
      if (userDetails) {
        this.loadUserAppointments(userDetails.uid); 
      }
    });
  }

  ngOnInit() {
    this.requestNotificationPermission();
    this.userService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
      this.loadUserAppointments(user.uid); 
    });
  }

  async requestNotificationPermission() {
    const granted = await LocalNotifications.requestPermissions();
    if (granted.display === 'granted') {
      console.log('Notification permissions granted');
    }
  }

  loadUserAppointments(uid: string) {
    this.appointmentsService
      .getAppointmentsForUser(uid)
      .subscribe((userAppointments) => {
        this.userAppointments = userAppointments;
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

  dismissReminderModal() {
    this.reminderModal.dismiss();
    this.reminderForm.reset();
  }

  openReminderModal(appointment: any) {
    this.selectedAppointment = appointment;
    this.reminderModal.present();
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

  async setAppointmentReminder() {
    if (this.reminderForm.valid && this.selectedAppointment) {
      const reminderTimeInMinutes = this.reminderForm.value.reminderTime;
      const appointmentDateTime = new Date(this.selectedAppointment.date_and_time);
      const reminderTime = new Date(appointmentDateTime.getTime() - reminderTimeInMinutes * 60 * 1000);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: this.selectedAppointment.id,
            title: 'Appointment Reminder',
            body: `You have an appointment with Dr. ${this.selectedAppointment.doctorName} in ${reminderTimeInMinutes} minutes.`,
            schedule: { at: reminderTime },
            sound: 'default',
            smallIcon: 'icon.png',
          },
        ],
      });

      this.showAlert('Reminder Set', `Reminder set for ${reminderTimeInMinutes} minutes before your appointment.`);
      this.dismissReminderModal();
    }
  }

  getFormattedDateTime(dateTimeStr: string): { date: string; time: string } {
    const dateTime = new Date(dateTimeStr);
    const year = dateTime.getFullYear();
    const month = dateTime.getMonth() + 1;
    const date = dateTime.getDate();
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    return {
      date: `${year}-${month}-${date}`,
      time: `${hours}:${minutes < 10 ? '0' : ''}${minutes}`,
    };
  }

  getAppointmentStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'medium';
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
