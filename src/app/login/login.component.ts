import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
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
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.buildForm();
    this.opener = window.opener;

    if (!this.opener) {
      this.directAccess = true;
      alert('Cannot access Login Page direcly');
      return;
    }

    this.opener.postMessage({
      action: 'SSO_PAGE_LOADED'
    }, '*');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) { return; }

    this.http.post('user/login', this.form.value).subscribe( x => {
      this.opener.postMessage({
        action: 'LOGIN',
        data: x
      }, '*');
      window.close();
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
    // console.log(event.data.data);
    // alert(JSON.stringify(event.data));
    // console.log('(B)', event);
    if (event.data.action === 'SUBMIT_APP_ID') {
      this.loadApplicationDetails(event.data.data);
    }
  }
}

/**
 * TODO:
 * 
 * Login failed on SSO, dont send message if login failed
 * login field msg ui
 * button hover color
 * form validation
 * 
 * Login success notification before posting message.
 * 
 * 
 * FUTURE FEATURE
 * SIGNUP / FORGOT PASSWORD
 */
