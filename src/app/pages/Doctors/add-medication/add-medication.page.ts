import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AlertController, IonModal } from '@ionic/angular';
import { MedicationService } from 'src/app/services/medication.service';

@Component({
  selector: 'app-add-medication',
  templateUrl: './add-medication.page.html',
  styleUrls: ['./add-medication.page.scss'],
})
export class AddMedicationPage implements OnInit {
  medicine = {
    id: '',
    medicine_name: '',
    medicationType: '',
    price: '',
    description: '',
    imageUrl: '',
  };
  userId: string | null = null;
  medication: any[] = [];
  selectedImage: string | ArrayBuffer | null = null;
  imageFile: File | null = null;
  constructor(
    private userAuth: AngularFireAuth,
    private fireStore: MedicationService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.userAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        console.log('current user:', this.userId);
        this.getMedication();
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async addMedication(modal: IonModal) {
    try {
      if (this.imageFile) {
        const imageUrl = await this.fireStore.uploadImage(this.imageFile);
        this.medicine.imageUrl = imageUrl;
      }

      if (this.medicine.id) {
        await this.fireStore.updateMedicine(this.medicine);
        this.showAlert('Success', 'Medication updated successfully!');
      } else {
        await this.fireStore.postMedication(this.medicine);
        this.showAlert('Success', 'Medication posted successfully!');
      }
      this.resetForm(modal);
      await modal.dismiss();
    } catch (error) {
      this.showAlert('Error', 'Error posting medication!');
    }
  }
  resetForm(modal: IonModal) {
    this.medicine = {
      medicine_name: '',
      price: '',
      medicationType: '',
      description: '',
      id: '',
      imageUrl: '',
    };
    this.selectedImage = null;
    this.imageFile = null;
    modal.dismiss();
  }

  async editMedicine(medicine: any, modal: IonModal) {
    this.resetForm(modal);
    this.medicine = {
      id: medicine.id,
      medicine_name: medicine.medicine_name,
      price: medicine.price,
      description: medicine.description,
      medicationType: medicine.medicationType,
      imageUrl: medicine.imageUrl,
    };

    await modal.present();
  }

  async deleteMedicine(medicine: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete the medicine for ${medicine.medicine_title}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.fireStore.deleteMedicine(medicine);
              this.showAlert(
                'Success',
                'medicine profile deleted successfully!'
              );
            } catch (error) {
              this.showAlert('Error', 'Error deleting medicine!');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  getMedication() {
    this.fireStore.fetchPostedMedication().subscribe((medication) => {
      this.medication = medication;
    });
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
