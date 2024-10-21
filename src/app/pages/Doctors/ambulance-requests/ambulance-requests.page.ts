import { Component, OnInit } from '@angular/core';
import { RequestAmbulanceService } from 'src/app/services/request-ambulance.service';
import { AngularFireAuth } from '@angular/fire/compat/auth'; 
import { LocalNotifications } from '@capacitor/local-notifications';
import { AngularFirestore } from '@angular/fire/compat/firestore';  

@Component({
  selector: 'app-ambulance-requests',
  templateUrl: './ambulance-requests.page.html',
  styleUrls: ['./ambulance-requests.page.scss'],
})
export class AmbulanceRequestsPage implements OnInit {
  requests: any[] = [];
  currentDoctorName: string = '';

  constructor(
    public fireservice: RequestAmbulanceService,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore 
  ) {}

  ngOnInit() {
    this.getAmbulanceRequests();
    this.getCurrentDoctor();
  }

  getCurrentDoctor() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.fireservice.getDoctorProfile(user.uid).then(doctorProfile => {
          this.currentDoctorName = doctorProfile?.name || 'Unknown Doctor';
        }).catch(error => {
          console.error('Error fetching doctor profile:', error);
        });
      }
    });
  }

  getAmbulanceRequests() {
    this.fireservice.fetchAmbulanceRequests().subscribe((requests) => {
      this.requests = requests;
    });
  }

  respondToRequest(ambulanceId: string, status: string, rejectionReason: string = '') {
    this.fireservice.updateAmbulanceRequestStatus(ambulanceId, status, rejectionReason).then(() => {
      console.log(`Ambulance request ${ambulanceId} has been ${status}`);
      
      this.sendNotification(ambulanceId, status, rejectionReason);

      this.getAmbulanceRequests(); 
    }).catch(error => {
      console.error("Error updating request status: ", error);
    });
  }

  sendNotification(ambulanceId: string, status: string, rejectionReason: string = '') {
    const ambulanceRequest = this.requests.find(req => req.id === ambulanceId);
  
    if (ambulanceRequest) {
      let notificationMessage = '';
      let notificationTitle = '';
      
      if (status === 'approved') {
        notificationTitle = 'Ambulance Request Approved';
        notificationMessage = `Dear ${ambulanceRequest.patientName}, your ambulance request has been approved. An ambulance is on its way to ${ambulanceRequest.patientAddress}. - ${this.currentDoctorName}`;
      } else if (status === 'rejected') {
        notificationTitle = 'Ambulance Request Rejected';
        notificationMessage = `Dear ${ambulanceRequest.patientName}, your ambulance request has been rejected. Reason: ${rejectionReason}. - ${this.currentDoctorName}`;
      }
  
      const notificationId = this.firestore.createId();

      const notificationData = {
        notificationId: notificationId,
        patientId: ambulanceRequest.patientId,
        patientName: ambulanceRequest.patientName,
        doctorName: this.currentDoctorName,
        title: notificationTitle,
        message: notificationMessage,
        status: status,
        timestamp: new Date(),
      };
  
      this.scheduleLocalNotification(notificationTitle, notificationMessage);
  
      this.fireservice.sendNotificationToFirestore(notificationData).then(() => {
        console.log('Notification saved to Firestore with ID:', notificationId);
      }).catch(error => {
        console.error('Error saving notification to Firestore:', error);
      });
    }
  }
  
  scheduleLocalNotification(title: string, message: string) {
    LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: message,
          id: Math.floor(Math.random() * 100000), 
          schedule: { at: new Date(Date.now() + 1000) },
         
          extra: null
        }
      ]
    }).then(() => {
      console.log('Local notification scheduled.');
    }).catch(error => {
      console.error('Error scheduling local notification:', error);
    });
  }
  
  getStatusIcon(status: string): string {
    switch (status) {
      case 'approved':
        return 'checkmark-circle-outline';
      case 'rejected':
        return 'close-circle-outline';
      case 'pending':
        return 'time-outline';
      default:
        return 'help-circle-outline';
    }
  }
}
