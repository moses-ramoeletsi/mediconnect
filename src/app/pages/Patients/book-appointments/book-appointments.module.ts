import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookAppointmentsPageRoutingModule } from './book-appointments-routing.module';

import { BookAppointmentsPage } from './book-appointments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookAppointmentsPageRoutingModule
  ],
  declarations: [BookAppointmentsPage]
})
export class BookAppointmentsPageModule {}
