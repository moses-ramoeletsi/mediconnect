import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { switchMap, map, filter } from 'rxjs/operators';
import { doctorModel, AppointmentModel } from 'src/app/model/userModel';
import { UserService } from 'src/app/services/user.service';
import { AppointmentsService } from 'src/app/services/appointments.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.page.html',
  styleUrls: ['./doctor-dashboard.page.scss'],
  providers: [DatePipe],
})
export class DoctorDashboardPage implements OnInit, OnDestroy {
  userName: string = '';
  user: Observable<doctorModel | null>;
  approvedAppointments: AppointmentModel[] = [];
  uid: string = '';
  now: Date = new Date(); 
  autoReloadInterval: any; 
  reloadIntervalTime: number = 60000; 
  appointmentSubscription: Subscription | undefined;

  constructor(
    private navCtrl: NavController,
    private fireServices: UserService,
    private afAuth: AngularFireAuth,
    private appointmentsService: AppointmentsService,
    private datePipe: DatePipe
  ) {
    this.user = this.afAuth.authState.pipe(
      filter((user) => !!user),
      switchMap((user) => {
        this.uid = user?.uid || ''; 
        return this.fireServices.getUserDetails(user);
      }),
      map((userDetails) => userDetails as doctorModel)
    );

    this.user.subscribe((userDetails) => {
      if (userDetails) {
        this.userName = userDetails.name;
        this.loadApprovedAppointments();
        this.setupAutoReload(); 
      }
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.autoReloadInterval) {
      clearInterval(this.autoReloadInterval); 
    }
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe(); 
    }
  }

  openChat() {
    this.navCtrl.navigateForward('/user-list');
  }

  loadApprovedAppointments() {
    this.appointmentSubscription = this.appointmentsService.getAppointmentsForDoctor(this.uid).subscribe(
      (appointments: AppointmentModel[]) => {
        const today = this.datePipe.transform(this.now, 'yyyy-MM-dd');
        this.approvedAppointments = appointments
          .filter(appointment => {
            const appointmentDate = this.datePipe.transform(appointment.date_and_time, 'yyyy-MM-dd');
            const appointmentTime = new Date(appointment.date_and_time);
            return (
              appointment.status === 'approved' &&
              appointmentDate === today &&
              appointmentTime > this.now 
            );
          })
          .slice(0, 2); 

        this.updatePassedAppointments(appointments); 
      },
      (error) => {
        console.error('Error fetching appointments:', error);
      }
    );
  }

  updatePassedAppointments(appointments: AppointmentModel[]) {
    appointments.forEach(appointment => {
      const appointmentTime = new Date(appointment.date_and_time);
      if (appointment.status === 'approved' && appointmentTime <= this.now) {
        this.appointmentsService.updateAppointmentStatus(appointment.id, 'completed')
          .then(() => {
            console.log(`Appointment ${appointment.id} marked as completed.`);
            this.loadApprovedAppointments(); 
          })
          .catch(error => {
            console.error('Error updating appointment status:', error);
          });
      }
    });
  }

  setupAutoReload() {
    this.autoReloadInterval = setInterval(() => {
      this.now = new Date(); 
      this.loadApprovedAppointments();
    }, this.reloadIntervalTime);
  }

  getFormattedDateTime(dateTimeStr: string): { date: string; time: string } {
    const date = this.datePipe.transform(dateTimeStr, 'yyyy-MM-dd');
    const time = this.datePipe.transform(dateTimeStr, 'HH:mm');
    return { date: date || '', time: time || '' };
  }
}
