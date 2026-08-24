export interface WorkerHierarchyNode {
  id: number;
  name: string;
  position?: string;
  sede?: string;
  photo?: string | null;
  has_subordinates: boolean;
}
