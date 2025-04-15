import { Club } from './club.model';

export interface Announcement {
  id?: number;
  title: string;
  content: string;
  createdAt?: Date;
  club?: Club;
}
