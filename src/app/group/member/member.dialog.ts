import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-member',
    templateUrl: './member.dialog.html',
    styleUrls: ['./member.dialog.scss'],
    standalone: false
})
export class MemberDialog implements OnInit {
  form!: FormGroup;
  groupId: string;

  constructor(
    public dialogRef: MatDialogRef<MemberDialog>,
    @Inject(MAT_DIALOG_DATA) public data: MemberDialogData,
  ) {
    this.groupId = data.groupId;
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(this.data.name, [Validators.required]),
    });
  }

  onSubmit(data: any) {
    const name: string = data.name;
    this.dialogRef.close(name);
  }
}

export class MemberDialogData {
  constructor(
    public groupId: string,
    public name: string = '',
  ) {}
}
