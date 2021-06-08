import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const access = sessionStorage.getItem('access');
    const secret = sessionStorage.getItem('secret');
    const token = sessionStorage.getItem('token');
    const verifier = sessionStorage.getItem('verifier');


    let aux = req.headers;
    aux = aux.set('access', access || '');
    aux = aux.set('secret', secret || '');
    aux = aux.set('token', token || '');
    aux = aux.set('verifier', verifier || '');

    const headers = req.clone({
        headers: aux
    });

    return next.handle(headers);
  }
}
