import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8080/clubsync/books';

  private uploadUrl = 'http://localhost:8080/clubsync/upload';

  constructor(private http: HttpClient) {}

  uploadBookCover(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', this.uploadUrl, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }
  
  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  createBook(book: Book): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book);
  }

  updateBook(id: number, book: Book): Observable<Book> {
    return this.http.put<Book>(`${this.apiUrl}/${id}`, book);
  }

  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }
  
  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  addBook(book: Book): Observable<Book> {
    return this.http.post<Book>(this.apiUrl, book);
  }
  
  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAvailableBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/available`);
  }


getPopularBooks(limit: number): Observable<Book[]> {
  return this.http.get<Book[]>(`${this.apiUrl}/popular?limit=${limit}`);
}

getPersonalizedRecommendations(userId: number): Observable<Book[]> {
  return this.http.get<Book[]>(
    `http://localhost:8080/clubsync/recommendations/personalized/${userId}`
  );
}

getRecentBooks(limit: number): Observable<Book[]> {
  return this.http.get<Book[]>(`${this.apiUrl}/recent?limit=${limit}`);
}
searchBooks(title: string): Observable<Book[]> {
  return this.http.get<Book[]>(`${this.apiUrl}/search?title=${encodeURIComponent(title)}`);
}
}