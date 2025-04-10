import { ForumPost } from "./ForumPost.model";
import { Reply } from "./Reply.model";
import { User } from "./user.model";


export interface Comment {
  idComment: number;
  content: string;
  author: User;
  commentDate: Date;
  forumPost: ForumPost;
  replies?: Reply[];
}