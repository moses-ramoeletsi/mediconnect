import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AlertController, IonModal } from '@ionic/angular';
import { HealthInformationService } from 'src/app/services/health-information.service';

@Component({
  selector: 'app-basic-health-information',
  templateUrl: './basic-health-information.page.html',
  styleUrls: ['./basic-health-information.page.scss'],
})
export class BasichealthInformationPage implements OnInit {

  disease = {
    id: '',
    disease_name: '',
    animal_type:'',
    description: '',
    symptoms: '',
    treatment: '',
  };
  
  diseases: any[] = [];
  constructor(
    private firestore: HealthInformationService,
    private alertController: AlertController
  
  ) { }

  ngOnInit() {
    this.getDiseases();
  }


  async addDisease(modal: IonModal) {
    try {
      if (this.disease.id) {
        await this.firestore.updateDisease(this.disease);
        this.showAlert('Success', 'Disease updated successfully!');
      } else {
        await this.firestore.postDisease(this.disease);
        this.showAlert('Success', 'Disease posted successfully!');    
      }
  
      this.resetDisease(modal);
      await modal.dismiss();
  
    } catch (error) {
      this.showAlert('Error', 'Error posting disease!');
    }
  }
  
  resetDisease(modal: IonModal) {
    this.disease = {
      id: '',
      disease_name: '',
      animal_type:'',
      description: '',
      symptoms: '',
      treatment: '',
    };
    modal.dismiss();
  }
  
  getDiseases() {
    this.firestore.fetchPostedDiseases().subscribe((diseases) => {
      this.diseases = diseases;
    });
  }
  
  async editDisease(disease: any, modal: IonModal) {
    this.resetDisease(modal);
    this.disease = {
      id: disease.id, 
      disease_name: disease.disease_name,
      description: disease.description,
      animal_type:disease.animal_type,
      symptoms: disease.symptoms,
      treatment: disease.meadication,
    };
  
    await modal.present();
  }
  
  async deleteDisease(disease: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete the disease for ${disease.disease_name}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.firestore.deleteDisease(disease);
              this.showAlert('Success', 'Disease deleted successfully!');
            } catch (error) {
              this.showAlert('Error', 'Error deleting disease!');
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
