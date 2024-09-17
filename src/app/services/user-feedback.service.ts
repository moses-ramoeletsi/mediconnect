import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserFeedbackService {

  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth) { }
  addUserFeedback(userFeedback: any) {
    const docRef = this.firestore.collection('userFeedback').doc();  
    const id = docRef.ref.id;  
    userFeedback.id = id; 
    return docRef.set(userFeedback);
  }
  
  getUserFeedback(userId: string): Observable<any[]> {
    return this.firestore
      .collection('userFeedback', ref => ref.where('userId', '==', userId))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data }; 
        }))
      );
  }
  fetchUserFeedBack(): Observable<any[]>{
    return this.firestore.collection('userFeedback').valueChanges();
  }
  
  getCurrentUser() {
    return this.auth.currentUser;
  }
  updateUserFeedback(userFeedback: any) {
    return this.firestore.collection('userFeedback').doc(userFeedback.id).update(userFeedback);
  }

  deleteUserFeedback(userFeedback: any) {
    return this.firestore.collection('userFeedback').doc(userFeedback.id).delete();
  }
}
