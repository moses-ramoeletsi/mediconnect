import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AlertController, IonModal } from '@ionic/angular';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {

  event= {
    id:'',
    event_title: '',
    description: '',
    date_and_time: '',
    location: '',
    host: '',
    authorId: '',
    authorName: '', 
  };
  userId: string | null = null;
  name: any;
  events: any[] = [];
  constructor(
    public fireStore: EventsService ,
    public alertController: AlertController,
    public userAuth: AngularFireAuth,
    public router: Router,
  ) { }

  ngOnInit() {
    this.userAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        console.log ('current user:', this.userId);
        this.fetchVetData(this.userId);
        this.getEvents();
      }
    });
  }
  fetchVetData(userId: string) {
    this.fireStore.getCurrentUserById(userId).then((userData) => {
    this.name = userData.name
    console.log('Facility Name:', this.name);
  }).catch(error => {
    console.error('Error fetching user data:', error);
  });
}


async addEvent(modal: IonModal) {
  try {
    const authorData = await this.fireStore.getCurrentUserById(this.userId || '');
    const authorName = authorData.name || 'Unknown'; 

    this.event.authorId = this.userId || ''; 
    this.event.authorName = authorName;      


    if (this.event.id) {
      await this.fireStore.updateEvent(this.event);
      this.showAlert('Success', 'Event updated successfully!');
    } else {
      await this.fireStore.postEvent(this.event);
      this.showAlert('Success', 'Event posted successfully!');    
    }

    this.resetEventForm(modal);

    await modal.dismiss();

  } catch (error) {
    this.showAlert('Error', 'Error posting Event!');
  }
}
resetEventForm(modal: IonModal) {
  this.event = {
    id: '',
    event_title: '',
    description: '',
    date_and_time: '',
    location: '',
    host: '',
    authorId: '',
    authorName: '',
  };
  modal.dismiss();
}


getEvents() {
  this.fireStore.fetchPostedEvents().subscribe((events) => {
    this.events = events;
  });
}
getFormattedDateTime(dateTimeStr: string): { date: string; time: string } {
  const dateTime = new Date(dateTimeStr);
  const year = dateTime.getFullYear();
  const month = dateTime.getMonth() + 1; 
  const date = dateTime.getDate();
  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();

  const formattedDate = `${year}-${month}-${date}`;
  const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

  return { date: formattedDate, time: formattedTime };
}
async editEvent(event: any, modal: IonModal) {
  this.resetEventForm(modal);
  this.event = {
    id: event.id,
    event_title: event.event_title,
    description: event.description,
    date_and_time: event.data_and_time,
    location: event.location,
    host: event.host,
    authorId: event.authorId,
    authorName: event.authorName,
  };
  
  await modal.present();
}
async deletePostedEvent(event: any) {
  const alert = await this.alertController.create({
    header: 'Confirm Delete',
    message: `Are you sure you want to delete the event for ${event.event_title}?`,
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        handler: async () => {
          try {
            await this.fireStore.deleteEvent(event);
            this.showAlert('Success', 'Event deleted successfully!');
          } catch (error) {
            this.showAlert('Error', 'Error deleting event!');
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
