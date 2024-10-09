import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private logoutSubject = new Subject<void>();

  constructor(private firebaseAuth: AngularFireAuth, private router:Router) { }
  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  async login(userLogin: { email: string; password: string }) {
    try {
      const userCredential = await this.firebaseAuth.signInWithEmailAndPassword(
        userLogin.email,
        userLogin.password
      );
      localStorage.setItem('user', JSON.stringify(userCredential.user));
      return userCredential;
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.firebaseAuth.signOut();
      localStorage.removeItem('user');
      this.logoutSubject.next();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout error', error);
    }
  }

  getLogoutObservable() {
    return this.logoutSubject.asObservable();
  }
}
