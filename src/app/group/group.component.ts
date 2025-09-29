import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, mergeMap, tap } from 'rxjs/operators';
import { Group, Member } from '../models/group.model';
import { GroupService } from './group.service';
import { MemberDialog, MemberDialogData } from './member/member.dialog';

@Component({
    selector: 'app-group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.scss'],
    standalone: false
})
export class GroupComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'vote', 'action'];
  groupId: string;
  group: Group;
  memberId: string;
  members: Member[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private groupService: GroupService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        map((params) => params['id']),
        tap((groupId) => (this.groupId = groupId)),
        mergeMap((groupId) =>
          this.groupService.exist(groupId).pipe(
            filter((exist) => {
              if (!exist) {
                this.navigateToHome();
              }
              return exist;
            }),
            map((_) => groupId),
          ),
        ),
        mergeMap((groupId) =>
          this.groupService.createMember(groupId).pipe(
            tap((memberId) => (this.memberId = memberId)),
            tap((_) => {
              this.groupService
                .onMembersChange(this.groupId)
                .subscribe((members) => {
                  console.log('members', members);
                  this.members = members;
                  if (members.length == 0) {
                    this.groupService.deleteGroup(this.groupId);
                  } else if (
                    members.every((member) => member.id != this.memberId)
                  ) {
                    this.navigateToHome();
                  } else {
                    this.members = members;
                  }
                });
            }),
            mergeMap((memberId) =>
              this.dialog
                .open(MemberDialog, {
                  disableClose: true,
                  data: new MemberDialogData(groupId),
                })
                .afterClosed()
                .pipe(
                  tap((name) =>
                    this.groupService.setName(groupId, memberId, name),
                  ),
                ),
            ),
          ),
        ),
      )
      .subscribe((_) => {
        this.groupService.onGroupChange(this.groupId).subscribe((group) => {
          this.group = group;
        });
      });
    window.addEventListener('beforeunload', (_) => {
      this.leave();
    });
  }

  ngOnDestroy(): void {
    this.leave();
  }

  private leave() {
    if (this.groupId && this.memberId) {
      if (!this.members || this.members.length > 1) {
        this.groupService.deleteMember(this.groupId, this.memberId);
      } else if (this.members[0].id == this.memberId) {
        this.groupService.deleteGroup(this.groupId);
      }
    }
  }

  private navigateToHome(): Promise<boolean> {
    return this.router.navigate(['/']);
  }

  get link(): string {
    return window.location.href;
  }

  get member(): Member | undefined {
    return this.members?.find((member) => member.id === this.memberId);
  }

  get name(): string {
    return this.member?.name;
  }

  get vote(): string {
    return this.member?.vote;
  }

  onCopyLink() {
    this.snackBar.open('Copied to Clipboard', null, {
      duration: 2048,
    });
  }

  onStoryChange(value: string): void {
    this.groupService.setStory(this.groupId, value);
  }

  onVote(value: string): void {
    this.groupService.setVote(this.groupId, this.memberId, value);
  }

  onDeleteMember(memberId: string): void {
    if (memberId == this.memberId) {
      this.navigateToHome();
    }
    this.groupService.deleteMember(this.groupId, memberId);
  }

  onResetVote(): void {
    this.groupService.clearVotes(this.groupId);
  }

  get allVoted(): boolean {
    return this.members?.every((member) => member.vote);
  }
}
