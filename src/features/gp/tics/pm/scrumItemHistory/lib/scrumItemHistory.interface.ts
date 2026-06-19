export interface ScrumItemHistoryUser {
  id: number;
  name: string;
}

export interface ScrumItemHistoryResource {
  id: number;
  item_id: number;
  field: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  user: ScrumItemHistoryUser;
}
