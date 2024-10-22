import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { Router } from '@angular/router';
import { GroupService } from '../group/group.service';
import { Group } from '../models/group.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  readonly cards = signal([
    '1',
    '2',
    '3',
    '5',
    '8',
    '13',
    '21',
    '34',
    '55',
    '89',
    '144',
  ]);
  readonly formControl = new FormGroup({
    name: new FormControl(''),
    cards: new FormControl(this.cards),
  });
  announcer = inject(LiveAnnouncer);

  constructor(
    private router: Router,
    private groupService: GroupService,
  ) {}

  ngOnInit(): void {}

  removeCard(keyword: string) {
    this.cards.update((keywords) => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }
      keywords.splice(index, 1);
      this.announcer.announce(`removed ${keyword} from cards`);
      return [...keywords];
    });
  }

  addCard(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.cards.update((keywords) =>
        [...keywords, value].sort((a, b) => {
          try {
            return Number(a) - Number(b);
          } catch (e) {
            return a > b ? -1 : 1;
          }
        }),
      );
      this.announcer.announce(`added ${value} to cards`);
    }
    event.chipInput!.clear();
  }

  onCreate() {
    const group: Group = {
      name: this.formControl.get('name').value,
      cards: this.cards(),
      story: '',
    };
    this.groupService.create(group).subscribe((id) => {
      this.router.navigate(['/groups', id]);
    });
  }
}
