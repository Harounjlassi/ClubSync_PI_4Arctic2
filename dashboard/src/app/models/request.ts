export interface Request {
    id?: number;
    user: { idUser: number }; // Changed from 'id' to 'idUser'
    requestDate?: string;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PURCHASED';
    title: string;
    author: string;
    isbn?: string;
    publisher?: string;
    requestReason?: string;
    adminFeedback?: string;
  }

  export enum RequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PURCHASED = 'PURCHASED'
  }

