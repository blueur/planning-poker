import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import { Group } from '../models/group';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  createGroupForm: FormGroup;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  cards: string[] = [
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
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private firestore: AngularFirestore,
  ) {
    this.createGroupForm = this.formBuilder.group({
      name: '',
    });
  }

  ngOnInit(): void {
  }

  onAddCard(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if (value && value.trim()) {
      this.cards.push(value.trim());
      this.cards = this.cards.sort((a, b) => {
        try {
          return Number(a) - Number(b);
        } catch (e) {
          return a > b ? -1 : 1
        }
      })
    }
    if (input) {
      input.value = '';
    }
  }

  onRemoveCard(card: string): void {
    this.cards = this.cards.filter(c => c !== card);
  }

  onCreate(data: any) {
    const group = new Group();
    group.name = data.name;
    group.cards = this.cards;
    console.info('new group: ', group);
    from(this.firestore.collection('groups')
      .add(Object.assign({}, group)))
      .pipe(map(document => document.id))
      .subscribe(id => {
        this.router.navigate(['/groups', id]);
      });
  }

}
