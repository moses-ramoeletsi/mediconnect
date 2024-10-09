export interface UserModel {
    name: string;
    email: string;
    address: string;
    gender:'',
    phoneNumber: string;
    password:string;
    uid:string;
  }
export interface doctorModel {
    name: string;
    email: string;
    specialty: string;
    gender:'',
    phoneNumber: string;
    password:string;
    uid:string;
  }
export interface AppointmentModel {
  id:string;
  uid:string;
  doctorId: string;
  doctorName: string;
  date_and_time: string,
  specialty: string;
  patientId:string,
  patientPhone: string;
  patientName:string;
  purpose:string,
  status:string;
}

  export interface AmbulanceRequestModel {
    id?: string;
    patientId: string;
    requestDate: string;
    status?: string;
    responseTime?: Date;
    rejectionReason?: string;
  }
