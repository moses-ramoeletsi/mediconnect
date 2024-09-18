import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})
export class UserListPage implements OnInit {

  users: any[] = [];
  currentUserEmail?: string;
  currentUserType?: string;
  currentUserId?: string;

  constructor(
    private authService: UserService,
    private router: Router,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(currentUser => {
      if (currentUser) {
        this.currentUserEmail = currentUser.email;
        this.currentUserType = currentUser.userType;
        this.currentUserId = currentUser.uid;
        this.authService.getUsers().subscribe(users => {
          const filteredUsers = users.filter(user =>
            user.email !== this.currentUserEmail &&
            (
              (this.currentUserType === 'doctor' && user.userType === 'patient') ||
              (this.currentUserType !== 'doctor' && user.userType === 'doctor')
            )
          );
          filteredUsers.forEach(user => {
            const chatId = this.createChatId(this.currentUserId!, user.uid);
            user.newMessageCount = 0;
            this.afs.collection('chats').doc(chatId).collection('messages', ref => ref.orderBy('timestamp', 'desc').limit(1))
              .valueChanges({ idField: 'id' })
              .subscribe((messages: any[]) => {
                if (messages.length > 0) {
                  const latestMessage = messages[0];
                  latestMessage.timestamp = (latestMessage.timestamp as firebase.firestore.Timestamp).toDate();
                  user.latestMessage = latestMessage;
                } else {
                  user.latestMessage = null;
                }
              });
            this.listenForNewMessages(user, chatId);
          });
          this.users = filteredUsers;
        });
      }
    });
  }

  createChatId(uid1: string, uid2: string): string {
    return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  }

  startChat(user: any) {
    const chatId = this.createChatId(this.currentUserId!, user.uid);
    this.afs.collection('chats').doc(chatId).collection('messages', ref => ref.where('read', '==', false))
      .get().subscribe(querySnapshot => {
        querySnapshot.forEach(doc => {
          doc.ref.update({ read: true });
        });
        user.newMessageCount = 0;
        this.users = [...this.users];
      });
    this.router.navigate(['/chats', user.uid]);
  }

  listenForNewMessages(user: any, chatId: string) {
    return this.afs.collection('chats').doc(chatId).collection('messages')
      .stateChanges(['added', 'modified'])
      .subscribe(actions => {
        actions.forEach(action => {
          const message: any = action.payload.doc.data();
          if (action.type === 'added' && !message.read && message.userId !== this.currentUserId) {
            user.newMessageCount++;
          } else if (action.type === 'modified' && message.read && message.userId !== this.currentUserId) {
            user.newMessageCount = Math.max(0, user.newMessageCount - 1);
          }
        });
        this.users = [...this.users];
      });
  }

  onBackButtonClick() {
    if (this.currentUserType === 'doctor') {
      this.router.navigate(['/doctor-dashboard']);
    } else if (this.currentUserType === 'patient') {
      this.router.navigate(['/patient-dashboard']);
    }
  }
}
