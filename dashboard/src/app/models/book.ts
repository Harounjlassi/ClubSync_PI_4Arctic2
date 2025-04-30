export interface Book {
    id?: number;
    title: string;
    author: string;
    isbn?: string | null;      
    publisher?: string | null;
    publicationDate?: string | null; 
    genre?: string | null;
    description?: string | null;
    language?: string | null;
    pageCount?: number | null;
    available?: boolean;
    totalCopies?: number | null;
    availableCopies?: number | null;
    coverImageUrl?: string | null;
  }