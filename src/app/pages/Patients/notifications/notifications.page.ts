import { Component, OnInit } from '@angular/core';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  notifications: any[] = [];
  loadingNotifications: boolean = true;

  constructor(private notificationsService: NotificationsService) {}

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
}
