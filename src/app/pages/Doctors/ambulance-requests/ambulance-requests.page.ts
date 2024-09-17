import { Component, OnInit } from '@angular/core';
import { RequestAmbulanceService } from 'src/app/services/request-ambulance.service';

@Component({
  selector: 'app-ambulance-requests',
  templateUrl: './ambulance-requests.page.html',
  styleUrls: ['./ambulance-requests.page.scss'],
})
export class AmbulanceRequestsPage implements OnInit {

  
  ambulance = {
    id: '',
    patientName: '',
    patientId: '',
    patientAddress: '',
    patientPhoneNumber: '',
    urgency: '',
    description: '',
  };
  requests: any[] = [];
  constructor(    public fireservice: RequestAmbulanceService,
  ) { }

  ngOnInit() {
    this.getAmbulanceRequests();
  }


  getAmbulanceRequests() {
    this.fireservice.fetchAmbulanceRequests().subscribe((requests) => {
      this.requests = requests;
    });
  }

}
