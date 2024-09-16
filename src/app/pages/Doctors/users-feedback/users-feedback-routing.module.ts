import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsersFeedbackPage } from './users-feedback.page';

const routes: Routes = [
  {
    path: '',
    component: UsersFeedbackPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersFeedbackPageRoutingModule {}
