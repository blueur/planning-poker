import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Group, Member } from '../models/group.model';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private readonly groups = 'groups';
  private readonly members = 'members';
  private firestore: Firestore = inject(Firestore);

  public create(group: Group): Observable<string> {
    console.info('new group', group);
    return from(
      addDoc(collection(this.firestore, this.groups), Object.assign({}, group)),
    ).pipe(map((document) => document.id));
  }

  private getGroup(groupId: string) {
    return doc(this.firestore, this.groups, groupId);
  }

  private getMembers(groupId: string) {
    return collection(this.firestore, this.groups, groupId, this.members);
  }

  private getMember(groupId: string, memberId: string) {
    return doc(this.firestore, this.groups, groupId, this.members, memberId);
  }

  public exist(groupId: string): Observable<boolean> {
    return from(getDoc(this.getGroup(groupId))).pipe(
      map((document) => document.exists()),
    );
  }

  public onGroupChange(groupId: string): Observable<Group> {
    return new Observable((observer) => {
      return onSnapshot(
        this.getGroup(groupId),
        (snapshot) => observer.next(snapshot.data() as Group),
        (error) => observer.error(error),
      );
    });
  }

  public onMembersChange(groupId: string): Observable<Member[]> {
    return new Observable((observer) => {
      return onSnapshot(
        this.getMembers(groupId),
        (snapshot) =>
          observer.next(
            snapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as Member,
            ),
          ),
        (error) => observer.error(error),
      );
    });
  }

  public deleteGroup(groupId: string): Promise<void> {
    console.info('removing group', groupId);
    return deleteDoc(this.getGroup(groupId));
  }

  public createMember(groupId: string): Observable<string> {
    return from(addDoc(this.getMembers(groupId), {})).pipe(
      map((document) => document.id),
    );
  }

  public deleteMember(groupId: string, memberId: string): Promise<void> {
    console.info('removing member', memberId);
    return deleteDoc(this.getMember(groupId, memberId));
  }

  public setStory(groupId: string, story: string): Promise<void> {
    return updateDoc(this.getGroup(groupId), {
      story: story,
    });
  }

  public setVote(
    groupId: string,
    memberId: string,
    vote: string,
  ): Promise<void> {
    return updateDoc(this.getMember(groupId, memberId), {
      vote: vote,
    });
  }

  public async clearVotes(groupId: string): Promise<void> {
    const collection = await getDocs(this.getMembers(groupId));
    collection.docs.forEach((doc) => {
      updateDoc(doc.ref, {
        vote: null,
      });
    });
  }

  public setName(
    groupId: string,
    memberId: string,
    name: string,
  ): Promise<void> {
    return updateDoc(this.getMember(groupId, memberId), {
      name: name,
    });
  }
}
