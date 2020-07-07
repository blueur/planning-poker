import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';

import * as firebase from 'firebase/app';

@Component({
  selector: 'app-member',
  templateUrl: './member.dialog.html',
  styleUrls: ['./member.dialog.scss']
})
export class MemberDialog implements OnInit {
  form: FormGroup;
  groupId: string;

  constructor(
    public dialogRef: MatDialogRef<MemberDialog>,
    @Inject(MAT_DIALOG_DATA) public data: MemberDialogData,
    private formBuilder: FormBuilder,
    private firestore: AngularFirestore,
  ) {
    this.form = this.formBuilder.group({
      name: '',
    });
    this.groupId = data.groupId;
  }

  ngOnInit(): void {
  }

  onSubmit(data: any) {
    const name: string = data.name;
    this.firestore
      .collection('groups')
      .doc(this.groupId)
      .update({
        members: firebase.firestore.FieldValue.arrayUnion(name)
      });
    this.dialogRef.close(name);
  }

}

export class MemberDialogData {
  constructor(
    public groupId: string,
  ) { }
}
