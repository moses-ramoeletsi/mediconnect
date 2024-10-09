import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable, tap } from 'rxjs';
import { AmbulanceRequestModel } from '../model/userModel';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class RequestAmbulanceService {

  constructor(private firestore: AngularFirestore, private datePipe: DatePipe) {}

  requestForAmbulance(ambulance: any) {
    const docRef = this.firestore.collection('request-ambulance').doc();
    const id = docRef.ref.id;
    ambulance.id = id;
    return docRef.set(ambulance);
  }

  async getCurrentUserById(userId: string): Promise<any> {
    try {
      const doc = await this.firestore.collection('users').doc(userId).get().toPromise();
      if (doc && doc.exists) {
        return doc.data();
      } else {
        throw new Error('User data not found');
      }
    } catch (error) {
      throw error;
    }
  }

  getUserAmbulanceRequests(patientId: string): Observable<any[]> {
    return this.firestore
      .collection('request-ambulance', ref => ref.where('patientId', '==', patientId))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }

  fetchAmbulanceRequests(): Observable<any[]> {
    return this.firestore.collection('request-ambulance').valueChanges();
  }

  deleteAmbulanceRequests(ambulance: any) {
    return this.firestore.collection('request-ambulance').doc(ambulance.id).delete();
  }

  updateAmbulanceRequests(ambulance: any) {
    return this.firestore.collection('request-ambulance').doc(ambulance.id).update(ambulance);
  }
  updateAmbulanceRequestStatus(ambulanceId: string, status: string, rejectionReason: string = '') {
    let updateData: any = {
      status: status,
      responseTime: new Date()
    };

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason; 
    }

    return this.firestore.collection('request-ambulance').doc(ambulanceId).update(updateData);
  }
  sendNotificationToFirestore(notificationData: any) {
    return this.firestore.collection('notifications').add(notificationData);
  }
    
  getDoctorProfile(doctorId: string): Promise<any> {
    return this.firestore.collection('users').doc(doctorId).get().toPromise().then(doc => {
      if (doc && doc.exists) {
        return doc.data(); 
      } else {
        throw new Error('Doctor profile not found');
      }
    }).catch(error => {
      throw error;
    });
  }

  getAllAmbulanceRequests(): Observable<any[]> {
    return this.firestore
      .collection('request-ambulance', ref => ref.orderBy('requestDate', 'desc'))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data };
        })),
        tap(requests => {
          if (requests.length === 0) {
            console.log('No ambulance requests found');
          }
        })
      );
  }
}
