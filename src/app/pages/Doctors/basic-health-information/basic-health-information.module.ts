import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BasichealthInformationPageRoutingModule } from './basic-health-information-routing.module';

import { BasichealthInformationPage } from './basic-health-information.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BasichealthInformationPageRoutingModule
  ],
  declarations: [BasichealthInformationPage]
})
export class BasichealthInformationPageModule {}
