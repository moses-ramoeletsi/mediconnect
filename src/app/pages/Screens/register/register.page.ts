import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerationType: string = 'register-patient';

  registerForm!: FormGroup;
  patientData = {
    name: '',
    email: '',
    gender: '',
    address: '',
    phoneNumber: '',
    password: '',
    uid: '',
    userType: 'patient',
  };

  doctorData = {
    name: '',
    email: '',
    gender: '',
    speciality: '',
    phoneNumber: '',
    password: '',
    uid: '',
    userType: 'doctor',
  };

  constructor(
    public fireserviceStore: UserService,
    public alertController: AlertController,
    public router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      gender: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[5-6]\d{7,}$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/[a-zA-Z0-9@_\-!]+/),
      ]),
    });

    this.updateFormControls();
  }

  updateFormControls() {
    if (this.registerationType === 'register-patient') {
      this.registerForm.addControl(
        'address',
        new FormControl('', Validators.required)
      );
      this.registerForm.removeControl('specialty');
    } else if (this.registerationType === 'register-doctor') {
      this.registerForm.addControl(
        'specialty',
        new FormControl('', Validators.required)
      );
      this.registerForm.removeControl('address');
    }
  }

  onRegistrationTypeChange() {
    this.updateFormControls();
  }

  registerUser() {
    if (this.registerForm.valid) {
      console.log('Form is valid:', this.registerForm.value);
      if (this.registerationType === 'register-patient') {
        this.createUserAccount();
      } else if (this.registerationType === 'register-doctor') {
        this.createVeterinarianAccount();
      }
    } else {
      console.log('Form is invalid:', this.registerForm.errors);
      this.showAlert('Form Error', 'Please check the form fields.');
    }
  }

  createUserAccount() {
    if (this.registerForm.valid) {
      const patientData = { ...this.patientData, ...this.registerForm.value };
      this.fireserviceStore
        .signupWithEmail(patientData)
        .then((userDetails) => {
          const user = userDetails.user;
          patientData.uid = user?.uid as string;
          this.fireserviceStore.saveUserDetails(patientData).then(() => {
            this.showAlert(
              'Registration Successful',
              'You are now registered!'
            );
            this.registerForm.reset();
            this.router.navigate(['/login']);
          });
        })
        .catch((error) => {
          this.showAlert(
            'Registration Error',
            'An error occurred during registration.'
          );
        });
    } else {
      this.showAlert('Form Error', 'Please check the form fields.');
    }
  }

  createVeterinarianAccount() {
    if (this.registerForm.valid) {
      const doctorData = { ...this.doctorData, ...this.registerForm.value };
      this.fireserviceStore
        .signupWithEmail(doctorData)
        .then((userDetails) => {
          const user = userDetails.user;
          doctorData.uid = user?.uid as string;
          this.fireserviceStore.saveUserDetails(doctorData).then(() => {
            this.showAlert(
              'Registration Successful',
              'You are now registered!'
            );
            this.registerForm.reset();
            this.router.navigate(['/login']);
          });
        })
        .catch((error) => {
          this.showAlert(
            'Registration Error',
            'An error occurred during registration.'
          );
        });
    } else {
      this.showAlert('Form Error', 'Please check the form fields.');
    }
  }

  userGender(value: string) {
    this.registerForm.get('gender')?.setValue(value);
  }

  showAlert(title: string, message: string) {
    this.alertController
      .create({
        header: title,
        message: message,
        buttons: ['OK'],
      })
      .then((alert) => alert.present());
  }
}
