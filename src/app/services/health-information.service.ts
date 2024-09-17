import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class HealthInformationService {

  constructor(private firestore: AngularFirestore) { }

  postDisease(disease: any) {
    const docRef = this.firestore.collection('diseases').doc();
    const id = docRef.ref.id;
    disease.id = id;
    return docRef.set(disease)
  }

  fetchPostedDiseases() {
    return this.firestore.collection('diseases').valueChanges({ idField: 'id' });
  }

  updateDisease(disease: any) {
    return this.firestore.collection('diseases').doc(disease.id).update(disease);
  }

  deleteDisease(disease: any) {
    return this.firestore.collection('diseases').doc(disease.id).delete();
  }
}
