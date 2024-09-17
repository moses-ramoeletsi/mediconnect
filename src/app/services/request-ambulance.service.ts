import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

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
