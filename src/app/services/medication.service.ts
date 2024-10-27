import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MedicationService {
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  postMedication(medicine: any) {
    const docRef = this.firestore.collection('medication').doc();
    const id = docRef.ref.id;
    medicine.id = id;
    return docRef.set(medicine);
  }
  updateMedicine(medicine: any) {
    return this.firestore
      .collection('medication')
      .doc(medicine.id)
      .update(medicine);
  }

  deleteMedicine(medicine: any) {
    return this.firestore.collection('medication').doc(medicine.id).delete();
  }

  fetchPostedMedication(): Observable<any[]> {
    return this.firestore.collection('medication').valueChanges();
  }
  async uploadImage(file: File): Promise<string> {
    const filePath = `medication_images/${new Date().getTime()}_${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    return new Promise((resolve, reject) => {
      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(
              (url) => {
                resolve(url);
              },
              (error) => {
                reject(error);
              }
            );
          })
        )
        .subscribe();
    });
  }
  createOrder(order: any): Promise<any> {
    return this.firestore.collection('orders').add(order);
  }

  fetchUserOrders(userId: string): Observable<any[]> {
    return this.firestore
      .collection('orders', (ref) => ref.where('userId', '==', userId))
      .valueChanges({ idField: 'id' });
  }
  fetchAllOrders(): Observable<any[]> {
    return this.firestore.collection('orders').valueChanges({ idField: 'id' });
  }
 
  deleteOrder(orderId: string): Promise<void> {
    return this.firestore.collection('orders').doc(orderId).delete();
  }
}
