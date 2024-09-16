import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocProfilePageRoutingModule } from './doc-profile-routing.module';

import { DocProfilePage } from './doc-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocProfilePageRoutingModule
  ],
  declarations: [DocProfilePage]
})
export class DocProfilePageModule {}
