import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.page.html',
  styleUrls: ['./doctor-dashboard.page.scss'],
})
export class DoctorDashboardPage implements OnInit {

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }

  openChat() {
    this.navCtrl.navigateForward('/chats');
  }

}
