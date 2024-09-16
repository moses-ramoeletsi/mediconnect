import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsersFeedbackPageRoutingModule } from './users-feedback-routing.module';

import { UsersFeedbackPage } from './users-feedback.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsersFeedbackPageRoutingModule
  ],
  declarations: [UsersFeedbackPage]
})
export class UsersFeedbackPageModule {}
