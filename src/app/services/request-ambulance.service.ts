import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestAmbulanceService {

  constructor( private firestore: AngularFirestore) { }

  requestForAmbulance(ambulance: any){
    const docRef = this.firestore.collection('request-ambulance').doc();
    const id = docRef.ref.id;
    ambulance.id = id;
    return docRef.set(ambulance)
  }

  async getCurrentUserById(userId: string) :Promise<any>{
    try{
      const doc = await this.firestore.collection('users').doc(userId).get().toPromise();
      if(doc && doc.exists){
        return doc.data();
      }else{
        throw new Error('User data not found');
      }
    }catch (error) {
      throw error;
    }
  }
  
  getUserAmbulanceRequests(patientId:string) : Observable<any[]>{
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
  fetchAmbulanceRequests() : Observable<any[]>{
    return this.firestore.collection('request-ambulance').valueChanges();
  }
deleterAmbulanceRequests(ambulance: any){
  return this.firestore.collection('request-ambulance').doc(ambulance.id).delete();
}

updateAmbulanceRequests(ambulance: any){
  return this.firestore.collection('request-ambulance').doc(ambulance.id).update(ambulance);
}
}
