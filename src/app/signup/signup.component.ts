import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { ApplicationInterface } from '../login/application.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from '../shared/services/util.service';
import { JkAlertService } from 'jk-alert';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  @Output() done = new EventEmitter<any>();
  @Input() application: ApplicationInterface;
  form: FormGroup;
  @HostBinding('class') onloadClass = '';

  constructor(
    private formBuilder: FormBuilder,
    private util: UtilityService,
    private jkAlert: JkAlertService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.buildForm();

    setTimeout( x => {
      this.onloadClass = 'loaded';
    });
  }

  errorClass(fieldname: string) {
    const field = this.form.get(fieldname);
    const matchPassword = fieldname === 'retype_password' ?  !this.isPasswordMatch() : false;
    return {
      ['invalid']: (field.invalid || matchPassword) && field.touched
    };
  }

  private isPasswordMatch() {
    return this.form.value.password === this.form.value.retype_password;
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      const errorMsgs = this.util.getFormValidationErrors(this.form);
      this.jkAlert.error(errorMsgs[0].message);
      return;
    }
    if (!this.isPasswordMatch()) {
      this.jkAlert.error('Password not match');
      return;
    }

    this.http.post(`user`, this.form.value).subscribe( (x: any) => {
      if (x.statusCode !== 200) {
        this.jkAlert.error(x.message);
      } else {
        this.form.reset();
        this.jkAlert.success(x.message);
        this.close();
      }
    });
  }

  close() {
    this.onloadClass = '';
    setTimeout( x => {
      this.done.emit(true);
    }, 500);
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      application: [this.application.id, [Validators.required]],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      retype_password: ['', [Validators.required]],
    });
  }
}
