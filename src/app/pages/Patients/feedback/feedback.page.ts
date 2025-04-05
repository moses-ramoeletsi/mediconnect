import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AlertController, IonModal } from '@ionic/angular';
import { Observable, filter, switchMap, map } from 'rxjs';
import { UserModel } from 'src/app/model/userModel';
import { UserFeedbackService } from 'src/app/services/user-feedback.service';
import { UserService } from 'src/app/services/user.service';
import emailjs, { EmailJSResponseStatus } from 'emailjs-com';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {
  userFeedback = {
    id: '',
    userId: '',
    name: '',
    email: '',
    feedBackType: '',
    message: '',
  };

  userName: string = '';
  user: Observable<UserModel | null>;
  feedback: any[] = [];
  userId: string = '';
  constructor(
    private userFeedBackServices: UserFeedbackService,
    private userAuth: AngularFireAuth,
    private fireservices: UserService,
    private alertController: AlertController
  ) {
    this.user = this.userAuth.authState.pipe(
      filter((user) => user !== null),
      switchMap((user) => {
        return this.fireservices.getUserDetails(user);
      }),
      map((userDetails) => userDetails as UserModel)
    );
    this.user.subscribe((userDetails) => {
      if (userDetails) {
        this.userName = userDetails.name;
        this.userFeedback.name = this.userName;
        this.loadUserFeedback(userDetails.uid);
      }
    });
  }
  loadUserFeedback(uid: string) {
    this.userFeedBackServices
      .getUserFeedback(this.userFeedback.userId)
      .subscribe((feedback) => {
        this.feedback = feedback;
      });
  }

  ngOnInit() {
    this.userAuth.user.subscribe((user) => {
      if (user) {
        this.userFeedback.userId = user.uid;

        this.userFeedback.name = this.userName;
      }
    });
  }
  sendFeedback() {
    const templateParams = {
      from_name: this.userFeedback.name,
      from_email: this.userFeedback.email,
      feedback_type: this.userFeedback.feedBackType,
      message: this.userFeedback.message,
    };

    emailjs.send('service_zl01dfe', 'template_szfwfyk', templateParams, 'J4QcwJbkk8BXHwX_N')
      .then((response: EmailJSResponseStatus) => {
        this.showAlert('Success', 'Feedback email sent successfully!');
      }, (error) => {
        this.showAlert('Error', 'Failed to send feedback email.');
        console.error('Failed to send feedback.', error);
      });
  }

  async submitFeedBack(modal: IonModal) {
    try {
      const user = await this.userAuth.currentUser;
      if (user) {
        this.userFeedback.userId = user.uid;
        this.userFeedback.name = this.userName;
      }

      if (this.userFeedback.id) {
        await this.userFeedBackServices.updateUserFeedback(this.userFeedback);
        this.showAlert('Success', 'Feedback updated successfully!');
      } else {
        await this.userFeedBackServices.addUserFeedback(this.userFeedback);
        this.showAlert('Success', 'Feedback submitted successfully!');
      }

      this.sendFeedback();

      this.loadUserFeedback(user!.uid);
      this.resetForm(modal);
    } catch (error) {
      this.showAlert('Error', 'Error submitting feedback!');
    }
  }

  resetForm(modal: IonModal) {
    this.userFeedback = {
      id: '',
      userId: '',
      name: '',
      email: '',
      feedBackType: '',
      message: '',
    };
    modal.dismiss();
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
  async edituserFeedback(userFeedback: any, modal: IonModal) {
    this.resetForm(modal);
    this.userFeedback = {
      id: userFeedback.id,
      userId: userFeedback.userId,
      name: userFeedback.name,
      email: userFeedback.email,
      feedBackType: userFeedback.feedBackType,
      message: userFeedback.message,
    };

    await modal.present();
  }

  async deleteuserFeedback(userFeedback: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete the profile for ${userFeedback.feedBackType}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.userFeedBackServices.deleteUserFeedback(userFeedback);
              this.showAlert('Success', 'Feedback deleted successfully!');
            } catch (error) {
              this.showAlert('Error', 'Error deleting Feedback!');
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
