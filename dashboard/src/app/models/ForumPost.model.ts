import { React } from "./React.model";
import { User } from "./user.model";


export interface ForumPost {
  id_post: number;
  content: string;
  author: User;
  post_date: Date;
  comments?: Comment[];
  reacts?: React[];
  imageBase64?: string | ArrayBuffer | null;
}