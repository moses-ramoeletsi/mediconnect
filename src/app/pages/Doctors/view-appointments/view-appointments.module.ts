import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewAppointmentsPageRoutingModule } from './view-appointments-routing.module';

import { ViewAppointmentsPage } from './view-appointments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewAppointmentsPageRoutingModule
  ],
  declarations: [ViewAppointmentsPage]
})
export class ViewAppointmentsPageModule {}
