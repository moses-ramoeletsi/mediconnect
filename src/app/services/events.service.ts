import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  constructor( private fireStore: AngularFirestore) { }

  postEvent(event: any){
    const docRef = this.fireStore.collection('events').doc();
    const id = docRef.ref.id;
    event.id = id;
    return docRef.set(event)
  }

  async getCurrentUserById(userId: string) :Promise<any>{
    try{
      const doc = await this.fireStore.collection('users').doc(userId).get().toPromise();
      if(doc && doc.exists){
        return doc.data();
      }else{
        throw new Error('User data not found');
      }
    }catch (error) {
      throw error;
    }
  }
  
  fetchPostedEvents() : Observable<any[]>{
    return this.fireStore.collection('events').valueChanges();
  }
deleteEvent(event: any){
  return this.fireStore.collection('events').doc(event.id).delete();
}

updateEvent(event: any){
  return this.fireStore.collection('events').doc(event.id).update(event);
}

}
