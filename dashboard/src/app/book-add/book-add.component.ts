import { Component, ElementRef, ViewChild } from '@angular/core';
import { BookService } from '../services/book.service';
import { Book } from '../models/book';
import { Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';

const DEFAULT_COVER_IMAGE = 'assets/book-covers/default-book-cover.jpg';

@Component({
  selector: 'app-book-add',
  templateUrl: './book-add.component.html',
  styleUrls: ['./book-add.component.css']
})
export class BookAddComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  newBook: Book = {
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationDate: null,
    genre: '',
    description: '',
    language: '',
    pageCount: 0,
    available: true,
    totalCopies: 1,
    availableCopies: 1,
    coverImageUrl: DEFAULT_COVER_IMAGE
  };

  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;
  errorMessage: string | null = null;
  uploadProgress: number | null = null;

  constructor(
    private bookService: BookService,
    private router: Router
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.errorMessage = null;
      
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        this.errorMessage = 'Only JPEG, JPG, PNG, or GIF images are allowed!';
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'Image must be less than 2MB!';
        return;
      }

      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    this.newBook.coverImageUrl = DEFAULT_COVER_IMAGE;
    this.fileInput.nativeElement.value = '';
  }

  addBook(): void {
    if (this.isSubmitting || !this.isFormValid()) return;

    this.isSubmitting = true;
    this.errorMessage = null;
    this.uploadProgress = 0;

    if (this.selectedFile) {
      this.uploadImage();
    } else {
      this.saveBook();
    }
  }

  private isFormValid(): boolean {
    return !!this.newBook.title && !!this.newBook.author;
  }

  private uploadImage(): void {
    if (!this.selectedFile) return;

    this.bookService.uploadBookCover(this.selectedFile).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          // Update progress bar
          this.uploadProgress = Math.round(100 * (event.loaded / (event.total || 1)));
        } else if (event.type === HttpEventType.Response) {
          // Set the URL from backend response (e.g. "/uploads/filename.jpg")
          this.newBook.coverImageUrl = event.body?.fileUrl || DEFAULT_COVER_IMAGE;
          this.saveBook();
        }
      },
      error: (err) => {
        this.handleUploadError(err);
      }
    });
  }

  private saveBook(): void {
    this.bookService.addBook(this.newBook).subscribe({
      next: () => {
        this.resetForm();
        this.router.navigate(['/books']);
      },
      error: (err) => {
        this.handleUploadError(err);
      }
    });
  }

  private resetForm(): void {
    this.isSubmitting = false;
    this.uploadProgress = null;
    this.imagePreview = null;
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
    
    this.newBook = {
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      publicationDate: null,
      genre: '',
      description: '',
      language: '',
      pageCount: 0,
      available: true,
      totalCopies: 1,
      availableCopies: 1,
      coverImageUrl: DEFAULT_COVER_IMAGE
    };
  }

  private handleUploadError(err: any): void {
    this.isSubmitting = false;
    this.uploadProgress = null;
    this.errorMessage = err.error?.error || err.message || 'Failed to upload. Please try again.';
    console.error('Upload error:', err);
  }

  public cancel(): void {
    this.router.navigate(['/books']);
  }
}    