import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberDialog } from './member.dialog';

describe('MemberNameDialog', () => {
  let component: MemberDialog;
  let fixture: ComponentFixture<MemberDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MemberDialog]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
