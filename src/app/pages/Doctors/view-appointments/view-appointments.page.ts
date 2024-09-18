import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AppointmentsService } from 'src/app/services/appointments.service';
import { ToastController } from '@ionic/angular';
import { DatePipe } from '@angular/common';

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

  async updateAppointmentStatus(appointmentId: string, status: string) {
    const toast = await this.toastController.create({
      message: 'Updating appointment status...',
      duration: 1000,
    });
    await toast.present();

    this.appointmentsService
      .updateAppointmentStatus(appointmentId, status)
      .then(() => {
        this.showSuccessToast('Appointment status updated successfully');
      })
      .catch((error) => {
        this.showErrorToast('Error updating appointment status');
        console.error('Error updating appointment status:', error);
      });
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
