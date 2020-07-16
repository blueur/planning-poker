import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import { Subscription, Observable, from } from 'rxjs';
import { Group, Member } from '../models/group.model';
import { map, tap, flatMap, filter } from 'rxjs/operators';

import * as firebase from 'firebase';
import { isDefined } from '@angular/compiler/src/util';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private collection: AngularFirestoreCollection<unknown>;
  private readonly groups = 'groups';
  private readonly members = 'members';

  constructor(
    private firestore: AngularFirestore,
  ) {
    this.collection = this.firestore.collection(this.groups);
  }

  public create(group: Group): Observable<string> {
    console.info('new group', group);
    return from(this.firestore.collection(this.groups)
      .add(Object.assign({}, group)))
      .pipe(map(document => document.id));
  }

  private getGroup(groupId: string): AngularFirestoreDocument<unknown> {
    return this.collection.doc(groupId);
  }

  private getMembers(groupId: string): AngularFirestoreCollection<unknown> {
    return this.getGroup(groupId).collection(this.members);
  }

  private getMember(groupId: string, memberId: string) {
    return this.getMembers(groupId).doc(memberId);
  }

  public exist(groupId: string): Observable<boolean> {
    return this.getGroup(groupId).get()
      .pipe(map(document => document.exists));
  }

  public onGroupChange(groupId: string): Observable<Group> {
    return this.getGroup(groupId).valueChanges()
      .pipe(filter(data => isDefined(data)))
      .pipe(map(data => Object.assign(new Group, data)));
  }

  public onMembersChange(groupId: string): Observable<Member[]> {
    return this.getMembers(groupId).valueChanges({ idField: 'id' })
      .pipe(map(data => data
        .map(doc => Object.assign(new Member, doc))
      ));
  }

  public delete(groupId: string): Promise<void> {
    console.info('removing document', groupId);
    return this.getGroup(groupId).delete();
  }

  public createMember(groupId: string): Observable<string> {
    return from(this.getMembers(groupId)
      .add({}))
      .pipe(map(document => document.id));
  }

  public deleteMember(groupId: string, memberId: string): Promise<void> {
    console.info('removing member', memberId);
    return this.getMember(groupId, memberId).delete();
  }

  public setStory(groupId: string, story: string): Promise<void> {
    return this.getGroup(groupId).update({
      story: story,
    });
  }

  public setVote(groupId: string, memberId: string, vote: string): Promise<void> {
    return this.getMember(groupId, memberId).update({
      vote: vote,
    });
  }

  public clearVotes(groupId: string): Subscription {
    return this.getMembers(groupId).get()
      .pipe(flatMap(collection => collection.docs.map(doc => doc.id)))
      .subscribe(memberId => this.getMember(groupId, memberId).update({
        vote: null,
      }));
  }

  public setName(groupId: string, memberId: string, name: string): Promise<void> {
    return this.getMember(groupId, memberId).update({
      name: name,
    });
  }
}
