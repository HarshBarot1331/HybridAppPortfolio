import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Message {
  id: string;
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = environment.apiUrl;
  private messageSource = new BehaviorSubject<Message[]>([]);
  currentMessages = this.messageSource.asObservable();

  constructor(private http: HttpClient) {
    this.loadMessages();
  }

  // Load messages from backend
  loadMessages(): void {
    this.http.get<{ messages: Message[] }>(`${this.apiUrl}/messages`).pipe(
      tap(response => {
        this.messageSource.next(response.messages || []);
      }),
      catchError((error) => {
        console.error('❌ Error loading messages from backend:', error);
        return throwError(() => error);
      })
    ).subscribe();
  }

  // Send a message to the backend
  sendMessage(message: string): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages`, { message }).pipe(
      tap(newMessage => {
        const currentMessages = this.messageSource.value;
        this.messageSource.next([...currentMessages, newMessage]);
      }),
      catchError((error) => {
        console.error('❌ Error sending message to backend:', error);
        return throwError(() => error);
      })
    );
  }

  // Delete a message from the backend
  deleteMessage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${id}`).pipe(
      tap(() => {
        const currentMessages = this.messageSource.value.filter(m => m.id !== id);
        this.messageSource.next(currentMessages);
      }),
      catchError((error) => {
        console.error('❌ Error deleting message from backend:', error);
        return throwError(() => error);
      })
    );
  }

  // Get all messages (Observable)
  getMessages(): Observable<Message[]> {
    return this.currentMessages;
  }
}
