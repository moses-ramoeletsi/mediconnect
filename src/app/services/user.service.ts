import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map, switchMap, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  currentUser!: '';
  constructor(
    public firebaseStore: AngularFirestore,
    public userAuth: AngularFireAuth
  ) {}

  signupWithEmail(data: { email: string; password: string }) {
    return this.userAuth.createUserWithEmailAndPassword(
      data.email,
      data.password
    );
  }
  saveUserDetails(data: any) {
    return this.firebaseStore.collection('users').doc(data.uid).set(data);
  }

  loginWithEmail(data: { email: string; password: string }) {
    return this.userAuth.signInWithEmailAndPassword(data.email, data.password);
  }
  getUserDetails(data: any) {
    return this.firebaseStore.collection('users').doc(data.uid).valueChanges();
  }

  // getVeterinarianDetails(uid: string): Observable<VeterinarianDetails | null> {
  //   return this.firebaseStore.collection('users', ref => ref.where('uid', '==', uid).where('userType', '==', 'veterinarian'))
  //     .valueChanges({ idField: 'id' })
  //     .pipe(
  //       map(vetArray => (vetArray.length > 0 ? vetArray[0] : null))
  //     ) as Observable<VeterinarianDetails | null>;
  // }

  getUsers(): Observable<any[]> {
    return this.firebaseStore
      .collection('users')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as Record<string, any>;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }
  getCurrentUser(): Observable<any> {
    return this.userAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.firebaseStore
            .collection('users')
            .doc(user.uid)
            .valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }
  getCurrentUserDetails(uid: string): Observable<any> {
    return this.firebaseStore.collection('users').doc(uid).valueChanges();
  }
  getAuth() {
    return this.userAuth;
  }

  getDoctors(): Observable<any[]> {
    return this.firebaseStore
      .collection('users', ref => ref.where('userType', '==', 'doctor'))
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as Record<string, any>;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }
}
