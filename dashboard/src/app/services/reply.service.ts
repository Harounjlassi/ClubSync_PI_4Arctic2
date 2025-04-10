import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reply } from 'app/models/Reply.model';

@Injectable({
  providedIn: 'root'
})
export class ReplyService {
  private apiUrl = `http://localhost:8080/clubsync/api/replies`;

  constructor(private http: HttpClient) { }

  createReply(reply: Reply): Observable<Reply> {
    return this.http.post<Reply>(this.apiUrl, reply);
  }

  updateReply(reply: Reply): Observable<Reply> {
    return this.http.put<Reply>(this.apiUrl, reply);
  }

  deleteReply(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getReplyById(id: number): Observable<Reply> {
    return this.http.get<Reply>(`${this.apiUrl}/${id}`);
  }

  getRepliesByComment(commentId: number): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${this.apiUrl}/comment/${commentId}`);
  }

  getRepliesByAuthor(authorId: number): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${this.apiUrl}/author/${authorId}`);
  }
}