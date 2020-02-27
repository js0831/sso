import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginModule } from './login/login.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpInterceptorService } from './shared/services/http-interceptor.service';
import { JkWaitModule } from 'jk-wait';
import { JkAlertModule } from 'jk-alert';
import { SignupModule } from './signup/signup.module';
import { TitleCasePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoginModule,
    SignupModule,
    JkWaitModule.forRoot({
      type: 'SPINNER'
    }),
    JkAlertModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    TitleCasePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
