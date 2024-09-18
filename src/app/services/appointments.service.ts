import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  constructor(private firestore: AngularFirestore) {}

  createAppointment(appointmentData: any): Promise<any> {
    return this.firestore.collection('appointments').add(appointmentData);
  }

  getAppointmentsForUser(uid: string): Observable<any[]> {
    return this.firestore
      .collection('appointments', ref => ref.where('patientId', '==', uid))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  getAppointmentsForDoctor(doctorId: string): Observable<any[]> {
    return this.firestore
      .collection('appointments', ref => ref.where('doctorId', '==', doctorId))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  updateAppointmentStatus(appointmentId: string, status: string): Promise<void> {
    return this.firestore.collection('appointments').doc(appointmentId).update({ status });
  }
}