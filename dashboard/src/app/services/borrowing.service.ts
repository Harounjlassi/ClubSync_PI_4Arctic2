// src/app/services/borrowing.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Borrowing } from '../models/borrowing';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BorrowingService {
  private baseUrl = 'http://localhost:8080/clubsync/borrowings';


  constructor(private http: HttpClient) {}

  // other methods...

  borrowBook(userId: number, bookId: number): Observable<Borrowing> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('bookId', bookId.toString());

    return this.http.post<Borrowing>(
      `${this.baseUrl}/borrow`,
      {},          
      { params }   
    );
  }
  getAllBorrowings(): Observable<Borrowing[]> {
    return this.http.get<Borrowing[]>(`${this.baseUrl}`);
  }

  returnBook(borrowingId: number): Observable<Borrowing> {
    return this.http.post<Borrowing>(
      `${this.baseUrl}/return/${borrowingId}`,
      {}  
    );
  }
}
