import { ForumPost } from "./ForumPost.model";
import { User } from "./user.model";

export interface React {
  id_react?: number;
  type: ReactType;
  author: User;
  react_date: Date;
  forumPost: ForumPost;
}

export enum ReactType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  HAHA = 'HAHA',
  WOW = 'WOW',
  SAD = 'SAD',
  ANGRY = 'ANGRY'
}