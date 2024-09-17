import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-order',
  templateUrl: './confirm-order.page.html',
  styleUrls: ['./confirm-order.page.scss'],
})
export class ConfirmOrderPage implements OnInit {

  orderId: string = '';
  total: number = 0;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras && navigation.extras.state) {
      this.orderId = navigation.extras.state['orderId'];
      this.total = navigation.extras.state['total'];
    }
  }

  ngOnInit() {
    if (!this.orderId || !this.total) {
      this.router.navigate(['/medication']);
    }
  }
}
