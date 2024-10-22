import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NavController } from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { switchMap, map, filter } from 'rxjs/operators';
import { doctorModel, AppointmentModel } from 'src/app/model/userModel';
import { UserService } from 'src/app/services/user.service';
import { AppointmentsService } from 'src/app/services/appointments.service';
import { DatePipe } from '@angular/common';
import { RequestAmbulanceService } from 'src/app/services/request-ambulance.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.page.html',
  styleUrls: ['./doctor-dashboard.page.scss'],
  providers: [DatePipe]
})
export class DoctorDashboardPage implements OnInit, OnDestroy {
  userName: string = '';
  user: Observable<doctorModel | null>;
  approvedAppointments: AppointmentModel[] = [];
  ambulanceRequests: any[] = []; 
  uid: string = '';
  now: Date = new Date(); 
  autoReloadInterval: any; 
  reloadIntervalTime: number = 60000; 
  appointmentSubscription: Subscription | undefined;
  ambulanceRequestSubscription: any;
  noAmbulanceRequestsToday: boolean = false;
  completionTimeouts: Map<string, any> = new Map();

  constructor(
    private navCtrl: NavController,
    private fireServices: UserService,
    private afAuth: AngularFireAuth,
    private appointmentsService: AppointmentsService,
    private ambulanceService: RequestAmbulanceService,
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
        this.loadAllAmbulanceRequests();
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
    if (this.ambulanceRequestSubscription) {
      this.ambulanceRequestSubscription.unsubscribe(); 
    }
    this.completionTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.completionTimeouts.clear();
  }

  openChat() {
    this.navCtrl.navigateForward('/user-list');
  }

  loadApprovedAppointments() {
    this.appointmentSubscription = this.appointmentsService.getAppointmentsForDoctor(this.uid).subscribe(
      (appointments: AppointmentModel[]) => {
        const today = this.datePipe.transform(this.now, 'yyyy-MM-dd');
        
        // Filter appointments and schedule completion
        appointments.forEach(appointment => {
          const appointmentDate = this.datePipe.transform(appointment.date_and_time, 'yyyy-MM-dd');
          const appointmentTime = new Date(appointment.date_and_time);
          
          if (appointment.status === 'approved') {
            // If appointment is today and hasn't been scheduled for completion yet
            if (appointmentDate === today && !this.completionTimeouts.has(appointment.id)) {
              this.scheduleAppointmentCompletion(appointment);
            }
          }
        });

        // Update the displayed appointments
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
      },
      (error) => {
        console.error('Error fetching appointments:', error);
      }
    );
  }

  scheduleAppointmentCompletion(appointment: AppointmentModel) {
    const appointmentTime = new Date(appointment.date_and_time);
    const now = new Date();
    
    const completionTime = new Date(appointmentTime.getTime() + 2 * 60000); // Add 2 minutes
    const delay = completionTime.getTime() - now.getTime();

    if (delay > 0) {
      if (this.completionTimeouts.has(appointment.id)) {
        clearTimeout(this.completionTimeouts.get(appointment.id));
      }

      const timeout = setTimeout(() => {
        this.appointmentsService.updateAppointmentStatus(appointment.id, 'completed')
          .then(() => {
            console.log(`Appointment ${appointment.id} marked as completed after 2 minutes.`);
            this.loadApprovedAppointments();
            this.completionTimeouts.delete(appointment.id);
          })
          .catch(error => {
            console.error('Error updating appointment status:', error);
          });
      }, delay);

      this.completionTimeouts.set(appointment.id, timeout);
    }
  }

  loadAllAmbulanceRequests() {
    this.ambulanceRequestSubscription = this.ambulanceService.getAllAmbulanceRequests().subscribe(
      (requests: any[]) => {
        const today = this.datePipe.transform(this.now, 'yyyy-MM-dd');
        this.ambulanceRequests = requests.filter((request) => {
          const requestDate = this.datePipe.transform(request.requestDate, 'yyyy-MM-dd');
          return request.status === 'approved' && requestDate === today;
        });
  
        if (this.ambulanceRequests.length === 0) {
          console.log('No approved ambulance requests for today.');
        }
      },
      (error) => {
        console.error('Error fetching ambulance requests:', error);
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
      this.loadAllAmbulanceRequests();
    }, this.reloadIntervalTime);
  }

  getFormattedDateTime(dateTimeStr: string): { date: string; time: string } {
    const date = this.datePipe.transform(dateTimeStr, 'yyyy-MM-dd');
    const time = this.datePipe.transform(dateTimeStr, 'HH:mm');
    return { date: date || '', time: time || '' };
  }
  
}
