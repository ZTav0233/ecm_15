import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { GrowlService } from './growl.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  constructor(private growlService: GrowlService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const modifiedReq = req.clone({
      setHeaders: {
        'ecmclientid': 'YBBAGCNwICCqKCB3gEggd0YIIHcAYJKoZIhvcSAQICAQB'
      },
    });

    return next.handle(modifiedReq).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Handle HttpResponse if needed
        }
      }),
      catchError((error: HttpErrorResponse) => {
        let message = error.statusText || 'An error occurred';

        const errorRegex = /(.+):(.+)/g;

        if (error.message) {
          message = error.message;
        }

        if (errorRegex.test(error.error) && error.error.indexOf('{') === -1 && error.error.indexOf('}') === -1) {
          errorRegex.exec(error.error);
          const matches = errorRegex.exec(error.error);
          if (matches !== null) {
            message = matches[matches.length - 1];
          }
        } else if (error.error && typeof error.error === 'object') {
          message = error.error.responseMessage;
        } else if (error.error && typeof error.error === 'string' && error.error.includes('{') && error.error.includes('}')) {
          message = JSON.parse(error.error).responseMessage;
        }

        if (!req.url.includes('getDesignationValues')) {
          this.growlService.showGrowl({
            severity: 'error',
            summary: 'Failure',
            detail: message
          });
        }

        return throwError(error);
      })
    );
  }
}
