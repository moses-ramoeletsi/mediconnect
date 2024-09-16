import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BasichealthInformationPage } from './basic-health-information.page';

const routes: Routes = [
  {
    path: '',
    component: BasichealthInformationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BasichealthInformationPageRoutingModule {}
