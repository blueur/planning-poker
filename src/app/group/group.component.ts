import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Group } from '../models/group';
import { MemberDialog, MemberDialogData } from './member/member.dialog';

import { GroupService } from './group.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  displayedColumns: string[] = ['name', 'vote'];
  id: string;
  group: Group;
  member: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private groupService: GroupService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.groupService.exist(this.id,
        () => {
          const dialogRef = this.dialog.open(MemberDialog, {
            disableClose: true,
            data: new MemberDialogData(this.id),
          });
          dialogRef.afterClosed()
            .subscribe(member => this.member = member);
        },
        () => {
          this.navigateToHome();
        });
    });
    this.groupService.onChange(this.id)
      .subscribe(group => {
        this.group = group
        if (this.member && !this.group.members.includes(this.member)) {
          this.navigateToHome();
        }
      });
    window.addEventListener('beforeunload', event => {
      if (this.member) {
        if (this.group.members.length <= 1) {
          this.groupService.delete(this.id);
        } else {
          this.groupService.deleteMember(this.id, this.member);
        }
      }
    });
  }

  private navigateToHome(): Promise<boolean> {
    return this.router.navigate(['/']);
  }

  get link(): string {
    return window.location.href;
  }

  onStoryChange(value: string): void {
    this.groupService.updateStory(this.id, value);
  }

  onVote(value: string): void {
    this.groupService.updateVote(this.id, this.member, value);
  }

  onResetVote(): void {
    this.groupService.clearVotes(this.id);
  }

  get allVoted(): boolean {
    return this.group.members.every(member => this.getVote(member));
  }

  get dataSource() {
    const allVoted = this.allVoted;
    return this.group.members.map(member => {
      const vote = this.getVote();
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

  getVote(member: string = this.member): string | undefined {
    return this.group.votes[member];
  }
}
