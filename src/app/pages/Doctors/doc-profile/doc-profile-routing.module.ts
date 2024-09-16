import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocProfilePage } from './doc-profile.page';

const routes: Routes = [
  {
    path: '',
    component: DocProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocProfilePageRoutingModule {}
