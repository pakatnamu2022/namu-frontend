export interface PostResource {
  id: number;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  image?: string;
  type: string;
}

export interface Comment {
  user: string;
  content: string;
  timestamp: string;
}

export interface User {
  name: string;
  position: string;
  avatar: string;
  department: string;
}
