import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  ) {
    this.form = this.formBuilder.group({
      name: data.name,
    });
    this.groupId = data.groupId;
  }

  ngOnInit(): void {
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
  ) { }
}
