import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AmbulanceRequestsPageRoutingModule } from './ambulance-requests-routing.module';

import { AmbulanceRequestsPage } from './ambulance-requests.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AmbulanceRequestsPageRoutingModule
  ],
  declarations: [AmbulanceRequestsPage]
})
export class AmbulanceRequestsPageModule {}
