import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AmbulanceRequestsPage } from './ambulance-requests.page';

const routes: Routes = [
  {
    path: '',
    component: AmbulanceRequestsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AmbulanceRequestsPageRoutingModule {}
