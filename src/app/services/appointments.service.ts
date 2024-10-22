import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date_and_time: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  specialty: string;
  reminderTime?: string | null;
  hasReminder?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  constructor(private firestore: AngularFirestore) {}

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
    return this.firestore.collection('notifications').add(notificationData);
  }
  
  async setAppointmentReminder(appointmentId: string, reminderTime: Date): Promise<void> {
    try {
      await this.firestore.collection('appointments').doc(appointmentId).update({
        reminderTime: reminderTime.toISOString(),
        hasReminder: true
      });

      await LocalNotifications.schedule({
        notifications: [
          {
            id: parseInt(appointmentId.substring(0, 8), 16), 
            title: 'Medical Appointment Reminder',
            body: `Your appointment is coming up soon!`,
            schedule: { at: reminderTime },
            sound: 'default',
            smallIcon: 'ic_notification',
          }
        ]
      });
    } catch (error) {
      console.error('Error setting reminder:', error);
      throw error;
    }
  }

  async cancelReminder(appointmentId: string): Promise<void> {
    try {
      await this.firestore.collection('appointments').doc(appointmentId).update({
        reminderTime: null,
        hasReminder: false
      });

      await LocalNotifications.cancel({
        notifications: [{ id: parseInt(appointmentId.substring(0, 8), 16) }]
      });
    } catch (error) {
      console.error('Error canceling reminder:', error);
      throw error;
    }
  }

  async checkAndUpdateReminders(): Promise<void> {
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
      appointmentsSnapshot.forEach(async (doc) => {
        const appointment = doc.data() as Appointment;
        if (appointment.reminderTime && new Date(appointment.reminderTime) <= now) {
          await this.cancelReminder(doc.id);
        }
      });
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