import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AppointmentsService } from 'src/app/services/appointments.service';
import { ToastController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-view-appointments',
  templateUrl: './view-appointments.page.html',
  styleUrls: ['./view-appointments.page.scss'],
  providers: [DatePipe],
})
export class ViewAppointmentsPage implements OnInit {
  appointment = {
    uid: '',
    doctorId: '',
    doctorName: '',
    specialty: '',
    patientId: '',
    patientName: '',
    patientPhone: '',
    purpose:'',
    status: 'pending',
  };

  userAppointments: any[] = [];
  uid: string = '';
  loadingAppointments: boolean = true;

  constructor(
    private userAuth: AngularFireAuth,
    private appointmentsService: AppointmentsService,
    private toastController: ToastController,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.userAuth.authState.subscribe((user) => {
      if (user) {
        this.uid = user.uid;
        console.log('current user:', this.uid);
        this.getAppointments();
      }
    });
  }

  getAppointments() {
    this.loadingAppointments = true;
    this.appointmentsService.getAppointmentsForDoctor(this.uid).subscribe(
      (userAppointments) => {
        this.userAppointments = userAppointments;
        this.loadingAppointments = false;
      },
      (error) => {
        this.loadingAppointments = false;
        this.showErrorToast('Failed to load appointments');
        console.error('Error fetching appointments:', error);
      }
    );
  }
  async updateAppointmentStatus(appointmentId: string, status: string, appointment: any) {
    const toast = await this.toastController.create({
      message: 'Updating appointment status...',
      duration: 1000,
    });
    await toast.present();
  
    this.appointmentsService.updateAppointmentStatus(appointmentId, status)
      .then(async () => {
        await this.addNotificationToFirestore(appointmentId, appointment.doctorName, appointment.patientName, appointment.patientId, appointment.purpose, status);
          await this.scheduleLocalNotification(appointmentId, appointment.doctorName, appointment.patientName, status);
  
        this.showSuccessToast('Appointment status updated successfully');
      })
      .catch((error) => {
        this.showErrorToast('Error updating appointment status');
        console.error('Error updating appointment status:', error);
      });
  }
  
  async addNotificationToFirestore(appointmentId: string, doctorName: string, patientName: string, patientId: string, purpose: string, status: string) {
    const notificationData = {
      appointmentId,
      doctorName,
      patientName,
      patientId,
      purpose,
      status,
      timestamp: new Date(),
    };
  
    return this.appointmentsService.addNotification(notificationData);
  }
  
  async scheduleLocalNotification(appointmentId: string, doctorName: string, patientName: string, status: string) {
   try{
     await LocalNotifications.schedule({
       notifications: [
         {
           title: `Appointment Status Changed`,
           body: `Your appointment with Dr. ${doctorName} has been ${status}.`,
           id: Math.floor(Math.random() * 100000), 
           schedule: { at: new Date(Date.now() + 1000) },
           extra: { appointmentId, doctorName, patientName, status },
          },
        ],
      });
      console.log('Local notification scheduled');
    } catch (error) {
      console.error('Error creating notification:', error);
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: `Appointment Status Changed`,
              body: `Your appointment with Dr. ${doctorName} has been ${status}.`,
              id: Math.floor(Math.random() * 100000),
              extra: { appointmentId, doctorName, patientName, status },
            }
          ]
        });
        console.log('Local notification scheduled without custom scheduling');
      } catch (retryError) {
        console.error('Error scheduling notification on retry:', retryError);
      }
    }
  }

  async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      color: 'success',
      duration: 2000,
    });
    toast.present();
  }

  async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      color: 'danger',
      duration: 2000,
    });
    toast.present();
  }

  getFormattedDateTime(dateTimeStr: string): { date: string; time: string } {
    const date = this.datePipe.transform(dateTimeStr, 'yyyy-MM-dd');
    const time = this.datePipe.transform(dateTimeStr, 'HH:mm');
    return { date: date || '', time: time || '' };
  }

  trackByAppointmentId(index: number, appointment: any): string {
    return appointment.id;
  }
}
