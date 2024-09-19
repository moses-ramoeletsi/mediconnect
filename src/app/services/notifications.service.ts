import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  constructor(private firestore: AngularFirestore, private afAuth: AngularFireAuth) {}

  // Fetch notifications for the current user
  getUserNotifications(): Observable<any[]> {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          // If the user is logged in, fetch their notifications
          return this.firestore
            .collection('notifications', ref => ref.where('patientId', '==', user.uid))
            .valueChanges({ idField: 'id' });
        } else {
          // If no user is logged in, return an empty array
          return of([]);
        }
      })
    );
  }
}
