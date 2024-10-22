
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
  [x: string]: any;
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
    this.requestNotificationPermissions();
    setInterval(() => {
      this.appointmentsService.checkAndUpdateReminders();
    }, 60000);
    this.userService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
      this.loadUserAppointments(user.uid); 
    });
  }


  async requestNotificationPermissions() {
    try {
      const perms = await LocalNotifications.requestPermissions();
      if (perms.display !== 'granted') {
        await this.showAlert(
          'Notifications Required',
          'Please enable notifications to receive appointment reminders.'
        );
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
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
    if (appointment.status !== 'approved') {
      this.showAlert(
        'Not Available',
        'Reminders can only be set for approved appointments.'
      );
      return;
    }
    
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
    if (!this.reminderForm.valid || !this.selectedAppointment) {
      return;
    }

    try {
      const appointmentDate = new Date(this.selectedAppointment.date_and_time);
      const minutesBefore = parseInt(this.reminderForm.value.reminderTime);
      const reminderTime = new Date(appointmentDate.getTime() - (minutesBefore * 60000));

      if (reminderTime <= new Date()) {
        throw new Error('Reminder time must be in the future');
      }

      await this.appointmentsService.setAppointmentReminder(
        this.selectedAppointment.id,
        reminderTime
      );

      await this.showAlert(
        'Reminder Set',
        `You will be notified ${minutesBefore} minutes before your appointment.`
      );
      this.dismissReminderModal();
    } catch (error) {
      await this.showAlert('Error', 'Failed to set reminder: ');
    }
  }

  async cancelReminder(appointmentId: string) {
    try {
      await this.appointmentsService.cancelReminder(appointmentId);
      await this.showAlert('Success', 'Reminder cancelled successfully');
    } catch (error) {
      await this.showAlert('Error', 'Failed to cancel reminder: ');
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
      case 'completed': 
        return 'medium';
      default:
        return 'medium';
    }
  }

  async deleteCompletedAppointment(appointment: any) {
    if (appointment.status !== 'completed') {
      await this.showAlert(
        'Not Allowed',
        'Only completed appointments can be deleted.'
      );
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this completed appointment?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.appointmentsService.deleteAppointment(appointment.id);
              await this.showAlert('Success', 'Appointment deleted successfully');
              this.loadUserAppointments(this.currentUser.uid);
            } catch (error) {
              await this.showAlert('Error', 'Failed to delete appointment');
            }
          }
        }
      ]
    });

    await alert.present();
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
