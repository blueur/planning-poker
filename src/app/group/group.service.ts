import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import { Subscription, Observable, from } from 'rxjs';
import { Group } from '../models/group';
import { map } from 'rxjs/operators';

import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private collection: AngularFirestoreCollection<unknown>;

  constructor(
    private firestore: AngularFirestore,
  ) {
    this.collection = this.firestore.collection('groups');
  }

  public create(group: Group): Observable<string> {
    console.info('new group: ', group);
    return from(this.firestore.collection('groups')
      .add(Object.assign({}, group)))
      .pipe(map(document => document.id));
  }

  public get(id: string): AngularFirestoreDocument<unknown> {
    return this.collection.doc(id);
  }

  public exist(id: string, onExist: () => void, onNotExist: () => void): Subscription {
    return this.get(id).get().subscribe(document => {
      if (document.exists) {
        onExist();
      } else {
        onNotExist();
      }
    })
  }

  public onChange(id: string): Observable<Group> {
    return this.get(id).valueChanges()
      .pipe(map(data => Object.assign(new Group, data)));
  }

  public delete(id: string): Promise<void> {
    console.info('removing document ', id);
    return this.get(id).delete();
  }

  public deleteMember(id: string, member: string): Promise<void> {
    console.info('removing member ', member);
    return this.get(id).update({
      members: firebase.firestore.FieldValue.arrayRemove(member)
    });
  }

  public updateStory(id: string, story: string): Promise<void> {
    return this.get(id).update({
      story: story,
    });
  }

  public updateVote(id: string, member: string, vote: string): Promise<void> {
    const votes = {};
    votes[member] = vote;
    return this.get(id).set({
      votes: votes
    }, { merge: true });
  }

  public clearVotes(id: string): Promise<void> {
    return this.get(id).update({
      votes: {}
    })
  }
}
