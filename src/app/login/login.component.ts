import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { JkAlertService } from 'jk-alert';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  formSubmitted = false;
  application: {
    name: string,
    url: string,
    logo?: string,
    theme: string
  };
  opener: any;
  directAccess = false;
  @ViewChild('loginContainer', {static: false}) loginContainer: ElementRef;
  private styleProperties = ['--theme', '--secondaryColor', '--gradient1', '--gradient2'];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private jkAlert: JkAlertService
  ) { }

  ngOnInit() {
    this.buildForm();
    this.opener = window.opener;

    if (!this.opener) {
      this.directAccess = true;
      this.jkAlert.error('Cannot access Login Page direcly');
      return;
    }

    this.opener.postMessage({
      action: 'SSO_PAGE_LOADED'
    }, '*');

  }

  private buildForm() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  errorClass(fieldname: string) {
    const field = this.form.get(fieldname);
    return {
      ['invalid']: field.invalid && (field.touched || this.formSubmitted)
    };
  }

  submit() {
    this.formSubmitted = true;
    if (this.form.invalid) {
      this.jkAlert.error('Please enter valid Email Address and Password');
      return;
    }

    this.http.post('user/login', this.form.value).subscribe( (x: any) => {

      if (x.statusCode !== 200) {
        this.jkAlert.error(x.message);
        return;
      }

      this.jkAlert.success(x.message);
      setTimeout( () => {
        this.opener.postMessage({
          action: 'LOGIN',
          data: x
        }, '*');
        window.close();
      }, 2000);
    });
  }

  loadApplicationDetails(id: string) {
    this.http.get(`application/${id}`).subscribe( (x: any) => {
      this.setStyleProperties(x.data);
      this.application = x.data;
    });
  }

  private setStyleProperties(data: any) {
    this.styleProperties.forEach( p => {
      this.loginContainer.nativeElement.style.setProperty(p, data[p.replace('--', '')]);
    });
  }

  @HostListener('window:message', ['$event'])
  onMessage(event) {
    if (event.data.action === 'SUBMIT_APP_ID') {
      this.loadApplicationDetails(event.data.data);
    }
  }
}

/**
 * TODO:
 * 
 * 
 * FUTURE FEATURE
 * SIGNUP / FORGOT PASSWORD
 */
