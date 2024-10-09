import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AlertController, IonModal } from '@ionic/angular';
import { filter, switchMap, map, Observable } from 'rxjs';
import { UserModel } from 'src/app/model/userModel';
import { RequestAmbulanceService } from 'src/app/services/request-ambulance.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-ambulance',
  templateUrl: './ambulance.page.html',
  styleUrls: ['./ambulance.page.scss'],
})
export class AmbulancePage implements OnInit {

  ambulance = {
    id: '',
    patientName: '',
    patientId: '',
    patientAddress: '',
    patientPhoneNumber: '',
    urgency: '',
    description: '',
    requestDate: '',
    status: 'pending'
  };
  userId:string = '';
  requests: any[] = [];
  user: Observable<UserModel | null>;
  isEditing: boolean = false;

  constructor(
    public fireservice: RequestAmbulanceService,
    public alertController: AlertController,
    public userservice: UserService,
    public userAuth: AngularFireAuth,
    public router: Router,
  ) {
    this.user = this.userAuth.authState.pipe(
      filter(user => user !== null),
      switchMap(user => {
        return this.userservice.getUserDetails(user);
      }),
      map(userDetails => userDetails as UserModel)
    );

    this.user.subscribe((userDetails) => {
      if (userDetails && !this.isEditing) {
        this.ambulance.patientName = userDetails.name;
        this.ambulance.patientPhoneNumber = userDetails.phoneNumber || '';
        this.ambulance.patientAddress = userDetails.address || '';
      }
    });
  }

  ngOnInit() {
    this.userAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        console.log('current user:', this.userId);
        this.getAmbulanceRequests();
      }
    });
  }

  async makeRequest(modal: IonModal) {
    try {
      if (!this.isEditing) {
        const patientData = await this.fireservice.getCurrentUserById(this.userId || '');
        this.ambulance.patientId = this.userId || '';
        this.ambulance.patientName = patientData.name || 'Unknown';
        this.ambulance.patientAddress = patientData.address || 'Unknown';
        this.ambulance.patientPhoneNumber = patientData.phoneNumber || 'Unknown';
      }
      
      this.ambulance.status = 'pending'; 
      this.ambulance.requestDate = new Date().toISOString();
  
      if (this.ambulance.id) {
        await this.fireservice.updateAmbulanceRequests(this.ambulance);
        this.showAlert('Success', 'Ambulance Request updated successfully!');
      } else {
        await this.fireservice.requestForAmbulance(this.ambulance);
        this.showAlert('Success', 'Ambulance Request posted successfully!');
      }
  
      this.resetAmbulanceForm(modal);
      await modal.dismiss();
  
    } catch (error) {
      this.showAlert('Error', 'Error posting ambulance request!');
    }
  }
  
  
  resetAmbulanceForm(modal: IonModal) {
    this.ambulance = {
      id: '',
      patientName: '',
      patientId: '',
      patientAddress: '',
      patientPhoneNumber: '',
      urgency: '',
      description: '',
      requestDate: '',
      status:'',
    };
    this.isEditing = false;
    modal.dismiss();
  }

  getAmbulanceRequests() {
    this.fireservice.getUserAmbulanceRequests(this.userId).subscribe((requests) => {
      this.requests = requests;
    });
  }

  async editAmbulanceRequest(ambulance: any, modal: IonModal) {
    this.resetAmbulanceForm(modal);
    this.ambulance = { ...ambulance };
    this.isEditing = true;
    await modal.present();
  }

  async deleteRequest(ambulance: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete the ambulance request for ${ambulance.urgency}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.fireservice.deleteAmbulanceRequests(ambulance);
              this.showAlert('Success', 'Ambulance Request deleted successfully!');
            } catch (error) {
              this.showAlert('Error', 'Error deleting ambulance request!');
            }
          }
        }
      ]
    });

    await alert.present();
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