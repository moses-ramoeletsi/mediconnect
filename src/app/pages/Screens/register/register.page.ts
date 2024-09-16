import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  registerationType: string = 'register-patient';
  constructor() { }
  
  onRegistrationTypeChange() {
  }

  ngOnInit() {
  }

}
