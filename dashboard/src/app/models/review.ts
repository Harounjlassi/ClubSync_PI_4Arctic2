// src/app/models/review.ts
export interface Review {
  id?: number;
  rating: number;
  comment?: string;
  reviewDate?: Date;
  book: {
    id: number;
    title?: string;  // Make title optional
  };
  user: {
    id: number;
    name?: string;  // Make name optional
  };
  edited?: boolean;
}