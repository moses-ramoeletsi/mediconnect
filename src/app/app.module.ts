import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DoctorNavBarComponent } from './components/doctor-nav-bar/doctor-nav-bar.component';
import { PatientsNavBarComponent } from './components/patients-nav-bar/patients-nav-bar.component';

@NgModule({
  declarations: [AppComponent, DoctorNavBarComponent, PatientsNavBarComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
