import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private router: Router) {}

  ngOnInit() {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'doctor') {
      this.router.navigate(['/doctor-dashboard']);
    }else if( userRole === 'patient'){
      this.router.navigate(['/patient-dashboard'])
    }
    else {
      this.router.navigate(['/login'])
    }
  }
}
