import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BookAppointmentsPage } from './book-appointments.page';

const routes: Routes = [
  {
    path: '',
    component: BookAppointmentsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookAppointmentsPageRoutingModule {}
