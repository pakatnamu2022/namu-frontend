export interface ScrumCommentUser {
  id: number;
  name: string;
}

export interface ScrumCommentResource {
  id: number;
  item_id: number;
  content: string;
  created_at: string;
  user: ScrumCommentUser;
}

export interface ScrumCommentRequest {
  item_id: number;
  content: string;
}
