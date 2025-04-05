import { AuthGuardService } from './services/auth-guard.service';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { DoctorNavBarComponent } from './components/doctor-nav-bar/doctor-nav-bar.component';
import { PatientsNavBarComponent } from './components/patients-nav-bar/patients-nav-bar.component';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/Screens/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  

  {
    path: '',
    component:DoctorNavBarComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        redirectTo: 'doctor-dashboard',
        pathMatch: 'full'
      },
      {
        path: 'view-appointments',
        loadChildren: () => import('./pages/Doctors/view-appointments/view-appointments.module').then( m => m.ViewAppointmentsPageModule)
      },
      {
        path: 'events',
        loadChildren: () => import('./pages/Doctors/events/events.module').then( m => m.EventsPageModule)
      },
      {
        path: 'doctor-dashboard',
        loadChildren: () => import('./pages/Doctors/doctor-dashboard/doctor-dashboard.module').then( m => m.DoctorDashboardPageModule)
      },
      {
        path: 'doc-profile',
        loadChildren: () => import('./pages/Doctors/doc-profile/doc-profile.module').then( m => m.DocProfilePageModule)
      },
    ]
  },
  
  {
    path:'',
    component: PatientsNavBarComponent,
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        redirectTo: 'patient-dashboard',
        pathMatch: 'full'
      },
      {
        path: 'patient-dashboard',
        loadChildren: () => import('./pages/Patients/patient-dashboard/patient-dashboard.module').then( m => m.PatientDashboardPageModule)
      },
      {
        path: 'ambulance',
        loadChildren: () => import('./pages/Patients/ambulance/ambulance.module').then( m => m.AmbulancePageModule)
      },
      {
        path: 'book-appointments',
        loadChildren: () => import('./pages/Patients/book-appointments/book-appointments.module').then( m => m.BookAppointmentsPageModule)
      },
      {
      path: 'patient-profile',
        loadChildren: () => import('./pages/Patients/patient-profile/patient-profile.module').then( m => m.PatientProfilePageModule)
      },
    ]
  },
  
    {
      path: 'register',
      loadChildren: () => import('./pages/Screens/register/register.module').then( m => m.RegisterPageModule)
    },
  {
    path: 'chats/:userId',
    loadChildren: () => import('./pages/Chats/chats/chats.module').then( m => m.ChatsPageModule)
  },
  {
    path: 'doctor-details',
    loadChildren: () => import('./pages/Patients/doctor-details/doctor-details.module').then( m => m.DoctorDetailsPageModule)
  },
  {
    path: 'ambulance-requests',
    loadChildren: () => import('./pages/Doctors/ambulance-requests/ambulance-requests.module').then( m => m.AmbulanceRequestsPageModule)
  },
  {
    path: 'add-medication',
    loadChildren: () => import('./pages/Doctors/add-medication/add-medication.module').then( m => m.AddMedicationPageModule)
  },
  {
    path: 'basic-health-information',
    loadChildren: () => import('./pages/Doctors/basic-health-information/basic-health-information.module').then( m => m.BasichealthInformationPageModule)
  },
  {
    path: 'feedback',
    loadChildren: () => import('./pages/Patients/feedback/feedback.module').then( m => m.FeedbackPageModule)
  },
  {
    path: 'medication',
    loadChildren: () => import('./pages/Patients/medication/medication.module').then( m => m.MedicationPageModule)
  },
  {
    path: 'upcoming-events',
    loadChildren: () => import('./pages/Patients/upcoming-events/upcoming-events.module').then( m => m.UpcomingEventsPageModule)
  },
  {
    path: 'health-information',
    loadChildren: () => import('./pages/Patients/health-information/health-information.module').then( m => m.HealthInformationPageModule)
  },
  {
    path: 'confirm-order',
    loadChildren: () => import('./pages/Patients/confirm-order/confirm-order.module').then( m => m.ConfirmOrderPageModule)
  },
  {
    path: 'user-list',
    loadChildren: () => import('./pages/Chats/user-list/user-list.module').then( m => m.UserListPageModule)
  },

  {
    path: 'notifications',
    loadChildren: () => import('./pages/Patients/notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
 
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules,  useHash: true  })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
