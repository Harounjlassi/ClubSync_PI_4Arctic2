import { ForumPost } from "./ForumPost.model";
import { Reply } from "./Reply.model";
import { User } from "./user.model";


export interface Comment {
  id_comment: number; 
  content: string;
  author: User;
  comment_date: Date; 
  forumPost: ForumPost;
  replies?: Reply[];
}