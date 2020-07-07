import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Group } from '../models/group';
import { map } from 'rxjs/operators';
import { MemberDialog, MemberDialogData } from './member/member.dialog';

import * as firebase from 'firebase/app';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  displayedColumns: string[] = ['name', 'vote'];
  id: string;
  document: AngularFirestoreDocument<unknown>;
  group: Group;
  member: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: AngularFirestore,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.document = this.firestore.collection('groups').doc(this.id);
      this.document.get()
        .subscribe(document => {
          if (document.exists) {
            const dialogRef = this.dialog.open(MemberDialog, {
              disableClose: true,
              data: new MemberDialogData(this.id),
            });
            dialogRef.afterClosed()
              .subscribe(member => this.member = member);
          } else {
            this.router.navigate(['/']);
          }
        });
    });
    this.firestore.collection('groups').doc(this.id).valueChanges()
      .pipe(map(data => Object.assign(new Group, data)))
      .subscribe(group => {
        this.group = group
        if (this.member && !this.group.members.includes(this.member)) {
          this.router.navigate(['/']);
        }
      });
    window.addEventListener('beforeunload', event => {
      if (this.member) {
        if (this.group.members.length <= 1) {
          console.info('removing document ', this.group.name);
          this.document.delete()
        } else {
          console.info('removing member ', this.member);
          this.document.update({
            members: firebase.firestore.FieldValue.arrayRemove(this.member)
          });
        }
      }
    });
  }

  get link(): string {
    return window.location.href;
  }

  onStoryChange(value: string): void {
    this.document.update({ story: value });
  }

  onVote(value: string): void {
    const votes = {};
    votes[this.member] = value;
    this.document.set({
      votes: votes
    }, { merge: true });
  }

  onResetVote(): void {
    this.document.update({
      votes: {}
    })
  }

  get allVoted() {
    return this.group.members.every(member => this.group.votes[member]);
  }

  get dataSource() {
    const allVoted = this.allVoted;
    return this.group.members.map(member => {
      const vote = this.group.votes[member];
      return {
        name: member,
        vote: allVoted ?
          vote :
          (vote ?
            'voted' :
            'waiting')
      }
    });
  }

}
