import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

import { Group } from '../models/group';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  createGroupForm: FormGroup;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private firestore: AngularFirestore,
  ) {
    this.createGroupForm = this.formBuilder.group({
      name: '',
      cards: '1,2,3,5,8,13,21,34,55,89,144',
    });
  }

  ngOnInit(): void {
  }

  onCreate(data: any) {
    const group = new Group();
    group.name = data.name;
    group.cards = data.cards.split(',')
      .map((card: string) => card.trim());
    console.info('new group: ', group);
    from(this.firestore.collection('groups')
      .add(Object.assign({}, group)))
      .pipe(map(document => document.id))
      .subscribe(id => {
        this.router.navigate(['/groups', id]);
      });
  }

}
