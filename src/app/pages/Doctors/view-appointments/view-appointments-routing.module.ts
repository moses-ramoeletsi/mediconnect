import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewAppointmentsPage } from './view-appointments.page';

const routes: Routes = [
  {
    path: '',
    component: ViewAppointmentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewAppointmentsPageRoutingModule {}
