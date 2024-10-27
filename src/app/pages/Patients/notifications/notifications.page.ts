import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  notifications: any[] = [];
  loadingNotifications: boolean = true;

  constructor(
    private notificationsService: NotificationsService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loadingNotifications = true;
    this.notificationsService.getUserNotifications().subscribe(
      (notifications) => {
        this.notifications = notifications;
        this.loadingNotifications = false;
      },
      (error) => {
        this.loadingNotifications = false;
        console.error('Error loading notifications:', error);
      }
    );
  }

  async deleteNotification(notification: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete this notification?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.notificationsService.deleteNotification(notification.id);
              this.showAlert('Success', 'Notification deleted successfully!');
              this.notifications = this.notifications.filter(n => n.notificationId !== notification.id);
            } catch (error) {
              this.showAlert('Error', 'Error deleting notification!');
              console.error('Error deleting notification:', error);
            }
          },
        },
      ],
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
