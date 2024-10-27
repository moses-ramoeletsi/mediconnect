import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private logoutSubject = new Subject<void>();
  private currentUserRole = new BehaviorSubject<string | null>(null);
  
  constructor(
    private firebaseAuth: AngularFireAuth,
    private router: Router,
    private location: Location
  ) {
    this.currentUserRole.next(localStorage.getItem('userRole'));
  }

  getCurrentUserRole() {
    return this.currentUserRole.asObservable();
  }

  async login(userLogin: { email: string; password: string }) {
    try {
      const userCredential = await this.firebaseAuth.signInWithEmailAndPassword(
        userLogin.email,
        userLogin.password
      );

      this.clearSessionData();
      
      localStorage.setItem('user', JSON.stringify(userCredential.user));
      return userCredential;
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  }

  async setUserRole(userType: string) {
    localStorage.setItem('userRole', userType);
    this.currentUserRole.next(userType);
    
    const dashboardRoute = this.getDashboardRouteForRole(userType);
    await this.router.navigate([dashboardRoute], {
      replaceUrl: true,
      skipLocationChange: true
    });
  }

  private getDashboardRouteForRole(role: string): string {
    switch (role) {
      case 'doctor':
        return '/doctor-dashboard';
      case 'patient':
        return '/patient-dashboard';
      default:
        return '/login';
    }
  }

  private clearSessionData() {
    localStorage.clear();
    sessionStorage.clear();
    this.currentUserRole.next(null);
  }

  async logout() {
    try {
      await this.firebaseAuth.signOut();
      this.clearSessionData();
      this.logoutSubject.next();
      
      this.location.replaceState('/');
      
      await this.router.navigate(['/login'], {
        replaceUrl: true,
        skipLocationChange: true
      });
      
      window.location.reload();
    } catch (error) {
      console.error('Logout error', error);
      throw error;
    }
  }

  getLogoutObservable() {
    return this.logoutSubject.asObservable();
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }
}