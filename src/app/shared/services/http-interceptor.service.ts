import { retry, map, catchError, finalize, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Injectable, Injector } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpUserEvent,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { JkWaitService } from 'jk-wait';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  public loading: JkWaitService;

  constructor(
    private injector: Injector,
    private route: Router
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable< HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

    this.loading = this.loading || this.injector.get(JkWaitService);
    this.loading.start();
    const withTokenRequest = req.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      },
      url: `${environment.apiUrl}${req.url}`
    });

    return next.handle(withTokenRequest).pipe(
      // retry(1),
      catchError((error: HttpErrorResponse) => {
        console.log(error.status);
        console.log(error.message);
        // if (error.status !== 401) {
          // 401 handled in auth.interceptor
          // alert(error.message);
        // }
        if (error.status === 500) {
          alert('Unknown error occured');
          window.close();
        }
        return throwError(error);
      }),
      finalize(() => {
          this.loading.end();
      }),
      tap((event: HttpEvent<any>) => {
        // console.log(event);
        // if (event instanceof HttpResponse) {
        //   const camelCaseObject = event.body;
        //   const modEvent = event.clone({ body: camelCaseObject });
        //   return modEvent;
        // }
        if (event instanceof HttpResponse) {
          if (event.body.statusCode === '406' || event.body.statusCode === '405') {
            // this.authService.logout().then( x => {
            //   this.route.navigate(['login']);
            // });
          }
        }
        return event;
      })
    );
  }
}
