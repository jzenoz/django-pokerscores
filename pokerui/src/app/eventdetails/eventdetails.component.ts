import { Component, Input, OnInit } from '@angular/core';
import {Event} from '../api/types';
import gql from 'graphql-tag';
import {ActivatedRoute} from '@angular/router';
import {Apollo} from 'apollo-angular';

import { faTrophy } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-eventdetails',
  templateUrl: './eventdetails.component.html',
  styleUrls: ['./eventdetails.component.scss']
})

export class EventdetailsComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private apollo: Apollo) { }

  @Input()
  eventId: number;
  event: Event;
  sub: any;

  faTrophy = faTrophy;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.eventId = + params.id;
    });

    interface Response {
      event: Event;
    }

    const EventQuery = gql`
        query GetEvent($id: Int!) {
          event(id: $id) {
            id
            date
            status
            host {
              id
              nickname
            }
            eventplayerSet {
              id
              player {
                id
                nickname
              }
              attendance
            }
            gameSet {
              id
              stake
              number
              gameplayerSet {
                id
                player {
                  id
                  nickname
                }
                position
                winnings
                rebuys
              }
            }
          }
        }
      `;

    this.apollo.watchQuery<Response>({
      query: EventQuery,
      variables: {
        id: this.eventId,
      }
    }).valueChanges.subscribe(({data}) => {
      console.log(data);
      this.event = data.event;
    });
  }

  filter_players(attendance_statuses, players) {
    if (players) {
      return players.filter(x => attendance_statuses.includes(x.attendance));
    } else {
      return null;
    }
  }
  status_text(status) {
    if (status === 'P') { return 'Proposed';  }
    if (status === 'C') { return 'Confirmed'; }
    if (status === 'X') { return 'Cancelled'; }
    if (status === 'F') { return 'Finished'; }
  }

  isPastYear() {
    const today = new Date();
    const eventDate = new Date(this.event.date);
    console.log(today);
    console.log(eventDate);
    return eventDate.getFullYear() < today.getFullYear();
  }

  comparePosition(player1, player2) {
    if (player1.position == player2.position) {
      return 0
    } else if (player1.position == 0) {
      return 1;
    } else if (player2.position == 0) {
      return -1;
    } else {
      return (player1.position < player2.position ? -1 : 1);
    }
  }

  playersOrderedByWinner(players) {
    const sorted = players.sort(this.comparePosition);
    console.log('sorted');
    console.log(sorted);
    return sorted;
  }
}