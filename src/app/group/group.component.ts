import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Group, Member } from '../models/group.model';
import { MemberDialog, MemberDialogData } from './member/member.dialog';

import { GroupService } from './group.service';
import { map, tap, flatMap, filter, isEmpty } from 'rxjs/operators';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'vote'];
  groupId: string;
  group: Group;
  memberId: string;
  members: Member[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private groupService: GroupService,
  ) { }

  ngOnInit(): void {
    this.route.params
      .pipe(map(params => params['id']))
      .pipe(tap(groupId => this.groupId = groupId))
      .pipe(flatMap(groupId => this.groupService.exist(groupId)
        .pipe(filter(exist => {
          if (!exist) {
            this.navigateToHome();
          }
          return exist;
        }))
        .pipe(map(_ => groupId))
      ))
      .pipe(flatMap(groupId => this.groupService.createMember(groupId)
        .pipe(tap(memberId => this.memberId = memberId))
        .pipe(tap(_ => {
          this.groupService.onMembersChange(this.groupId)
            .subscribe(members => {
              if (members.length <= 0) {
                this.groupService.delete(this.groupId);
              } else if (members.every(member => member.id != this.memberId)) {
                this.navigateToHome();
              } else {
                this.members = members;
              }
            });
        }))
        .pipe(flatMap(memberId => this.dialog
          .open(MemberDialog, {
            disableClose: true,
            data: new MemberDialogData(
              groupId,
            ),
          })
          .afterClosed()
          .pipe(tap(name => this.groupService.setName(groupId, memberId, name)))
        ))
      ))
      .subscribe(_ => {
        this.groupService.onGroupChange(this.groupId)
          .subscribe(group => {
            this.group = group
          });
      });
    window.addEventListener('beforeunload', _ => {
      this.leave();
    });
  }

  ngOnDestroy(): void {
    this.leave()
  }

  private leave() {
    if (this.groupId && this.memberId) {
      if (!this.members || this.members.length > 1) {
        this.groupService.deleteMember(this.groupId, this.memberId);
      } else {
        this.groupService.delete(this.groupId);
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
    return this.members?.find(member => member.id === this.memberId);
  }

  get name(): string {
    return this.member?.name;
  }

  get vote(): string {
    return this.member?.vote;
  }

  onStoryChange(value: string): void {
    this.groupService.setStory(this.groupId, value);
  }

  onVote(value: string): void {
    this.groupService.setVote(this.groupId, this.memberId, value);
  }

  onResetVote(): void {
    this.groupService.clearVotes(this.groupId);
  }

  get allVoted(): boolean {
    return this.members?.every(member => member.vote);
  }

  get dataSource() {
    const allVoted = this.allVoted;
    return this.members ?
      this.members
        .map(member => {
          const name = member.name;
          const vote = member.vote;
          return {
            name: name ? name : '?',
            vote: allVoted ?
              vote :
              (vote ?
                'voted' :
                'waiting')
          }
        }) :
      [];
  }
}
