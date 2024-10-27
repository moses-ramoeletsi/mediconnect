
import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, IonModal, AlertController, Platform } from '@ionic/angular';
import { filter, map, Observable, switchMap } from 'rxjs';
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
  hasNotificationPermission: boolean = false;
  isMobile: boolean = false;

  constructor(
    private navCtrl: NavController,
    private userService: UserService,
    private userAuth: AngularFireAuth,
    private alertController: AlertController,
    private appointmentsService: AppointmentsService,
    private fb: FormBuilder,
    private platform: Platform,
  ) {
    this.isMobile = this.platform.is('mobile');
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

  async ngOnInit() {
    await this.initializeNotifications();
    this.userService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
      this.loadUserAppointments(user.uid);
    });
  }

  async initializeNotifications() {
    if (this.isMobile) {
      try {
        const isSupported = await LocalNotifications.checkPermissions();
        
        if (isSupported.display === 'prompt') {
          const perms = await LocalNotifications.requestPermissions();
          this.hasNotificationPermission = perms.display === 'granted';
        } else {
          this.hasNotificationPermission = isSupported.display === 'granted';
        }

        if (!this.hasNotificationPermission) {
          await this.showNotificationPermissionAlert();
        }

        await LocalNotifications.registerActionTypes({
          types: [
            {
              id: 'APPOINTMENT_REMINDER',
              actions: [
                {
                  id: 'view',
                  title: 'View Appointment',
                },
                {
                  id: 'dismiss',
                  title: 'Dismiss',
                  destructive: true,
                },
              ],
            },
          ],
        });

        LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          if (notification.actionId === 'view') {
            this.navCtrl.navigateForward(`/appointments/${notification.notification.extra.appointmentId}`);
          }
        });

      } catch (error) {
        console.error('Error initializing notifications:', error);
        this.hasNotificationPermission = false;
      }
    }
  }

  async showNotificationPermissionAlert() {
    const alert = await this.alertController.create({
      header: 'Enable Notifications',
      message: 'To receive appointment reminders, please enable notifications in your device settings.',
      buttons: [
        {
          text: 'Later',
          role: 'cancel',
        },
        {
          text: 'Open Settings',
          handler: () => {
            if (this.platform.is('ios')) {
              window.open('app-settings:');
            } else if (this.platform.is('android')) {
              window.open('package:' + window.location.hostname);
            }
          },
        },
      ],
    });
    await alert.present();
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

   async openReminderModal(appointment: any) {
    if (appointment.status !== 'approved') {
      await this.showAlert(
        'Not Available',
        'Reminders can only be set for approved appointments.'
      );
      return;
    }

    if (this.isMobile && !this.hasNotificationPermission) {
      await this.showNotificationPermissionAlert();
      return;
    }
    
    this.selectedAppointment = appointment;
    this.reminderModal.present();
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

    
    const notification = {
      id: parseInt(this.selectedAppointment.id.substring(0, 8), 16),
      title: 'Upcoming Medical Appointment',
      body: `Reminder: You have an appointment with Dr. ${this.selectedAppointment.doctorName} in ${minutesBefore} minutes.`,
      schedule: { at: reminderTime },
      sound: 'default', 
      attachments: [],
      actionTypeId: 'APPOINTMENT_REMINDER',
      extra: {
        appointmentId: this.selectedAppointment.id,
      },
      smallIcon: 'ic_launcher_foreground', 
      iconColor: '#488AFF'
    };

    if (this.isMobile) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: notification.id,
              title: notification.title,
              body: notification.body,
              schedule: notification.schedule,
              sound: notification.sound,
              smallIcon: notification.smallIcon,
              iconColor: notification.iconColor,
              extra: notification.extra
            }
          ]
        });
      } catch (error) {
        console.error('Error scheduling notification:', error);
        throw new Error('Failed to schedule notification');
      }
    }

    await this.appointmentsService.setAppointmentReminder(
      this.selectedAppointment.id,
      reminderTime,
      notification
    );

    await this.showAlert(
      'Reminder Set',
      `You will be notified ${minutesBefore} minutes before your appointment.`
    );
    this.dismissReminderModal();
  } catch (error) {
    console.error('Error setting reminder:', error);
    await this.showAlert('Error', 'Failed to set reminder. Please try again.');
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
