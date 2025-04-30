export interface Borrowing {
  id?: number;
  book: {
    id: number;
  };
  user: {
    id: number;
  };
  borrowDate: Date;
  returnDate?: Date;
}
