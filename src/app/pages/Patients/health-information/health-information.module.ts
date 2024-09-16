import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HealthInformationPageRoutingModule } from './health-information-routing.module';

import { HealthInformationPage } from './health-information.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HealthInformationPageRoutingModule
  ],
  declarations: [HealthInformationPage]
})
export class HealthInformationPageModule {}
