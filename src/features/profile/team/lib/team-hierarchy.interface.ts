export interface WorkerHierarchyNode {
  id: number;
  name: string;
  position?: string;
  sede?: string;
  photo?: string | null;
  has_subordinates: boolean;
}

export interface WorkerHierarchySearchResult {
  id: number;
  name: string;
  position?: string;
  /** Ids de los nodos a expandir, en orden, desde el hijo directo de la raíz hasta este resultado. */
  path: number[];
}
