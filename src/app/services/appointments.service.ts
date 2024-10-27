import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular';

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date_and_time: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  specialty: string;
  reminderTime?: string | null;
  hasReminder?: boolean;
  notification?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private isMobile: boolean;
  constructor(private firestore: AngularFirestore,
    private platform: Platform
  ) {

    this.isMobile = this.platform.is('mobile');
  }


  createAppointment(appointmentData: any) {
    const docRef = this.firestore.collection('appointments').doc();
    const id = docRef.ref.id;
    appointmentData.id = id;
    return docRef.set(appointmentData)
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
  addNotification(notificationData: any) {
    const docRef = this.firestore.collection('notifications').doc();
    const id = docRef.ref.id;
    notificationData.id = id;
    return docRef.set(notificationData)
  }

  async setAppointmentReminder(
    appointmentId: string, 
    reminderTime: Date,
    notification: any
  ): Promise<void> {
    try {
      await this.firestore.collection('appointments').doc(appointmentId).update({
        reminderTime: reminderTime.toISOString(),
        hasReminder: true,
        notification: notification
      });

    } catch (error) {
      console.error('Error setting reminder:', error);
      throw error;
    }
  }

  async cancelReminder(appointmentId: string): Promise<void> {
    try {
      const appointmentDoc = await this.firestore
        .collection('appointments')
        .doc(appointmentId)
        .get()
        .toPromise();

      if (appointmentDoc?.exists) {
        const appointment = appointmentDoc.data() as Appointment;
        
        if (this.isMobile && appointment.notification) {
          await LocalNotifications.cancel({
            notifications: [{ id: appointment.notification.id }]
          });
        }

        await this.firestore.collection('appointments').doc(appointmentId).update({
          reminderTime: null,
          hasReminder: false,
          notification: null
        });
      }
    } catch (error) {
      console.error('Error canceling reminder:', error);
      throw error;
    }
  }

  async checkAndUpdateReminders(): Promise<void> {
    if (!this.isMobile) return;

    try {
      const now = new Date();
      const appointmentsSnapshot = await this.firestore
        .collection<Appointment>('appointments', ref => 
          ref.where('status', '==', 'approved')
             .where('hasReminder', '==', true)
             .where('reminderTime', '<=', now.toISOString())
        )
        .get()
        .toPromise();

      if (appointmentsSnapshot) {
        const batch = this.firestore.firestore.batch();
        const pendingCancellations: Promise<void>[] = [];

        appointmentsSnapshot.forEach(doc => {
          const appointment = doc.data() as Appointment;
          if (appointment.reminderTime && new Date(appointment.reminderTime) <= now) {
            if (appointment.notification) {
              pendingCancellations.push(
                LocalNotifications.cancel({
                  notifications: [{ id: appointment.notification.id }]
                })
              );
            }

            batch.update(doc.ref, {
              reminderTime: null,
              hasReminder: false,
              notification: null
            });
          }
        });

        await Promise.all([...pendingCancellations, batch.commit()]);
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  deleteAppointment(appointmentId: string): Promise<void> {
    return this.firestore.collection('appointments').doc(appointmentId).delete();
  }

  markAppointmentAsCompleted(appointmentId: string): Promise<void> {
    return this.firestore.collection('appointments').doc(appointmentId).update({ 
      status: 'completed',
      hasReminder: false,
      reminderTime: null 
    });
  }
}