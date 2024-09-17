import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { MedicationService } from 'src/app/services/medication.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-medication',
  templateUrl: './medication.page.html',
  styleUrls: ['./medication.page.scss'],
})
export class MedicationPage implements OnInit {

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
  cart: any[] = [];
  total: number = 0;
  constructor(
    private firestore: MedicationService,
    private fireservice: UserService, 
    private router: Router,
    private toastController: ToastController  
  ) { }

  ngOnInit() {
    this.getMedication();
    this.getCurrentUserId();
  }
  getCurrentUserId() {
    this.fireservice.getCurrentUser().subscribe(user => {
      if (user) {
        this.userId = user.uid;
      }
    });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000, 
      position: 'bottom' 
    });
    toast.present();
  }
  getMedication() {
    this.firestore.fetchPostedMedication().subscribe((medication) => {
      this.medication = medication;
    });
  }

  parseFloat(value: string): number {
    return parseFloat(value);
  }

  addToCart(medicine: any) {
    const cartItem = {
      ...medicine,
      quantity: 1,
      cartItemId: Date.now().toString()
    };
    this.cart.push(cartItem);
    this.calculateTotal();
  }

  increaseQuantity(item: any) {
    item.quantity++;
    this.calculateTotal();
  }
  decreaseQuantity(item: any) {
    if (item.quantity > 0) {
      item.quantity--;
      if (item.quantity === 0) {
        this.cart = this.cart.filter(cartItem => cartItem.uid !== item.uid);
      }
      this.calculateTotal();
    }
  }
  calculateTotal() {
    this.total = this.cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  }
  removeFromCart(item: any) {
    const index = this.cart.findIndex(cartItem => cartItem.cartItemId === item.cartItemId);
    if (index > -1) {
      this.cart.splice(index, 1);
      this.calculateTotal();
    }
  }
  checkout() {
    if (!this.userId) {
      console.error('User not logged in');
      this.router.navigate(['/login']);
      return;
    }
  
    this.fireservice.getCurrentUserDetails(this.userId).subscribe(userDetails => {
      if (!userDetails) {
        console.error('User details not found');
        return;
      }
  
      const orderItems = this.cart.map(item => {
        if (!item.id || !item.medicine_name || !item.price || !item.quantity) {
          throw new Error(`Invalid item data: ${JSON.stringify(item)}`);
        }
        return {
          medicineId: item.id, 
          medicineName: item.medicine_name,
          quantity: item.quantity,
          price: item.price
        };
      });
  
      const order = {
        userId: this.userId,
        clientName: userDetails.name,
        clientAddress: userDetails.address,
        items: orderItems,
        total: this.total,
        timestamp: new Date()
      };
  
      this.firestore.createOrder(order).then((docRef) => {
        this.presentToast('Order successfully placed');  
        const orderId = docRef.id;
        this.router.navigate(['/confirm-order'], {
          state: {
            orderId: orderId,
            total: this.total
          }
        });
        this.cart = [];
        this.total = 0;
      }).catch(error => {
        this.presentToast('Error placing order: ' + error.message); 
        console.error('Error placing order:', error);
      });
    });
  }

}
