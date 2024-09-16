import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AmbulancePage } from './ambulance.page';

const routes: Routes = [
  {
    path: '',
    component: AmbulancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AmbulancePageRoutingModule {}
