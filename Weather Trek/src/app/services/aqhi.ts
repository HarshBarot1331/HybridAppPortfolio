import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AqhiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getOntarioAQHI(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ontario-aqhi`).pipe(
      catchError((error) => {
        console.error('❌ Error fetching Ontario AQHI from backend:', error);
        throw error;
      })
    );
  }
}
