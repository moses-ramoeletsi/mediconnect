import { Component, OnInit } from '@angular/core';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-upcoming-events',
  templateUrl: './upcoming-events.page.html',
  styleUrls: ['./upcoming-events.page.scss'],
})
export class UpcomingEventsPage implements OnInit {
  event= {
    event_title: '',
    description: '',
    date_and_time: '',
    location: '',
    host: '',
  };
  events: any[] = [];
  constructor( public fireStore: EventsService) { }

  ngOnInit() {
    this.fetchPostedEvents();
  }
  
  fetchPostedEvents() {
    this.fireStore.fetchPostedEvents().subscribe((events) => {
      this.events = events;
    });
  }
  getFormattedDateTime(dateTimeStr: string): { date: string; time: string } {
    const dateTime = new Date(dateTimeStr);
    const year = dateTime.getFullYear();
    const month = dateTime.getMonth() + 1; 
    const date = dateTime.getDate();
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
  
    const formattedDate = `${year}-${month}-${date}`;
    const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  
    return { date: formattedDate, time: formattedTime };
  }
}
