import { Component, OnInit } from '@angular/core';
import { UserFeedbackService } from 'src/app/services/user-feedback.service';

@Component({
  selector: 'app-users-feedback',
  templateUrl: './users-feedback.page.html',
  styleUrls: ['./users-feedback.page.scss'],
})
export class UsersFeedbackPage implements OnInit {

  userFeedback = {
    id: '', 
    userId: '',
    name:"",
    email:"",
    feedBackType: "",
    message:""
  };
  
  feedback: any[] = [];

  constructor(
    private userFeedBackServices: UserFeedbackService
  ) {}
   loadUserFeedback(uid: string) {
    this.userFeedBackServices.getUserFeedback(this.userFeedback.userId).subscribe(feedback => {
      this.feedback = feedback;
    });
  }

  ngOnInit() {
    this.getUserFeedBack();
  } 
  getUserFeedBack(){
    this.userFeedBackServices.fetchUserFeedBack().subscribe((feedback) =>{
      this.feedback = feedback;
    })
  }

}
