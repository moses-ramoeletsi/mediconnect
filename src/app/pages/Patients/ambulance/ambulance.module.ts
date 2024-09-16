import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AmbulancePageRoutingModule } from './ambulance-routing.module';

import { AmbulancePage } from './ambulance.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AmbulancePageRoutingModule
  ],
  declarations: [AmbulancePage]
})
export class AmbulancePageModule {}
