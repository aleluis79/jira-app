import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComunService {

  constructor(private http: HttpClient) { }

  login(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Home/login`);
  }

  access(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Home/access`);
  }

  issues(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/Home/result`);
  }

}
