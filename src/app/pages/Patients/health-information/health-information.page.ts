import { Component, OnInit } from '@angular/core';
import { HealthInformationService } from 'src/app/services/health-information.service';

@Component({
  selector: 'app-health-information',
  templateUrl: './health-information.page.html',
  styleUrls: ['./health-information.page.scss'],
})
export class HealthInformationPage implements OnInit {
  disease = {
    id: '',
    disease_name: '',
    animal_type: '',
    description: '',
    symptoms: '',
    treatment: '',
  };

  diseases: any[] = [];
  constructor(private firestore: HealthInformationService) {}

  ngOnInit() {
    this.getCommonDiseases();
  }

  getCommonDiseases() {
    this.firestore.fetchPostedDiseases().subscribe((diseases) => {
      this.diseases = diseases;
    });
  }
}
