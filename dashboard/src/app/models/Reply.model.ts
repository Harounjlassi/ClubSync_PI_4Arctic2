import { Comment } from "./Comment.model";
import { User } from "./user.model";

export interface Reply {
  idReply: number;
  content: string;
  author: User;
  replyDate: Date;
  comment: Comment;
}