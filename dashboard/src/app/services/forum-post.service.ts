import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ForumPost } from 'app/models/ForumPost.model';

@Injectable({
  providedIn: 'root'
})
export class ForumPostService {
  private apiUrl = `http://localhost:8080/clubsync/api/forum-posts`;

  constructor(private http: HttpClient) { }

  createForumPost(forumPost: ForumPost): Observable<ForumPost> {
    return this.http.post<ForumPost>(this.apiUrl, forumPost);
  }

  updateForumPost(forumPost: ForumPost): Observable<ForumPost> {
    return this.http.put<ForumPost>(this.apiUrl, forumPost);
  }

  deleteForumPost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getForumPostById(id: number): Observable<ForumPost> {
    return this.http.get<ForumPost>(`${this.apiUrl}/${id}`);
  }

  getAllForumPosts(): Observable<ForumPost[]> {
    return this.http.get<ForumPost[]>(this.apiUrl);
  }
}