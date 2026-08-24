import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Loader2, Search, X } from "lucide-react";
import { errorToast } from "@/core/core.function";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  WorkerHierarchyNode,
  WorkerHierarchySearchResult,
} from "../../lib/team-hierarchy.interface";
import {
  useExpandHierarchyNode,
  useSearchHierarchy,
} from "../../lib/team-hierarchy.hook";
import { layoutHierarchy } from "../../lib/treeLayout";
import TeamHierarchyNode, {
  type TeamHierarchyFlowNode,
} from "./TeamHierarchyNode";

const nodeTypes = { teamMember: TeamHierarchyNode };

interface TeamHierarchyTreeProps {
  root: WorkerHierarchyNode;
  onConsult: (id: number) => void;
  className?: string;
}

function buildNode(
  worker: WorkerHierarchyNode,
  isRoot: boolean,
): TeamHierarchyFlowNode {
  return {
    id: String(worker.id),
    type: "teamMember",
    position: { x: 0, y: 0 },
    data: {
      worker,
      isRoot,
      isExpanded: false,
      isLoadingChildren: false,
      onConsult: () => {},
      onExpand: () => {},
    },
  };
}

function TeamHierarchyTreeInner({
  root,
  onConsult,
  className,
}: TeamHierarchyTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<TeamHierarchyFlowNode>(
    [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const expandNode = useExpandHierarchyNode();
  const { fitView } = useReactFlow();

  const handleConsult = useCallback(
    (id: number) => onConsult(id),
    [onConsult],
  );

  const handleExpand = useCallback(
    async (id: number) => {
      if (expandedIds.has(id)) {
        // Colapsar: remover todos los descendientes de este nodo
        const remove = new Set<string>();
        const queue = [String(id)];
        while (queue.length) {
          const parentId = queue.shift()!;
          edges
            .filter((e) => e.source === parentId && !remove.has(e.target))
            .forEach((e) => {
              remove.add(e.target);
              queue.push(e.target);
            });
        }

        const remainingNodes = nodes.filter((n) => !remove.has(n.id));
        const remainingEdges = edges.filter(
          (e) => !remove.has(e.source) && !remove.has(e.target),
        );
        const { nodes: layouted } = layoutHierarchy(
          remainingNodes,
          remainingEdges,
        );
        setNodes(layouted);
        setEdges(remainingEdges);
        setExpandedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        requestAnimationFrame(() => fitView({ duration: 300 }));
        return;
      }

      setLoadingIds((prev) => new Set(prev).add(id));
      try {
        const children = await expandNode(id);

        const existingIds = new Set(nodes.map((n) => n.id));
        const newNodes = children
          .filter((child) => !existingIds.has(String(child.id)))
          .map((child) => buildNode(child, false));
        const allNodes = [...nodes, ...newNodes];

        const existingEdgeIds = new Set(edges.map((e) => e.id));
        const newEdges: Edge[] = children
          .map((child) => ({
            id: `e-${id}-${child.id}`,
            source: String(id),
            target: String(child.id),
          }))
          .filter((e) => !existingEdgeIds.has(e.id));
        const allEdges = [...edges, ...newEdges];

        const { nodes: layoutedNodes } = layoutHierarchy(allNodes, allEdges);
        setNodes(layoutedNodes);
        setEdges(allEdges);
        setExpandedIds((prev) => new Set(prev).add(id));
        requestAnimationFrame(() => fitView({ duration: 300 }));
      } catch (error: any) {
        errorToast(
          error?.response?.data?.message ??
            "No se pudo cargar el equipo de esta persona",
        );
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [expandedIds, expandNode, edges, nodes, setEdges, setNodes, fitView],
  );

  // Navega hasta un resultado de búsqueda: expande en cadena todos los
  // nodos intermedios (los que aún no están expandidos) y centra/resalta
  // el nodo encontrado.
  const goToSearchResult = useCallback(
    async (result: WorkerHierarchySearchResult) => {
      const chain = [root.id, ...result.path.slice(0, -1)];
      setIsNavigating(true);
      try {
        let currentNodes = nodes;
        let currentEdges = edges;
        const newExpanded = new Set(expandedIds);

        for (const parentId of chain) {
          if (newExpanded.has(parentId)) continue;

          const children = await expandNode(parentId);

          const existingIds = new Set(currentNodes.map((n) => n.id));
          const newNodes = children
            .filter((child) => !existingIds.has(String(child.id)))
            .map((child) => buildNode(child, false));
          currentNodes = [...currentNodes, ...newNodes];

          const existingEdgeIds = new Set(currentEdges.map((e) => e.id));
          const newEdges: Edge[] = children
            .map((child) => ({
              id: `e-${parentId}-${child.id}`,
              source: String(parentId),
              target: String(child.id),
            }))
            .filter((e) => !existingEdgeIds.has(e.id));
          currentEdges = [...currentEdges, ...newEdges];

          newExpanded.add(parentId);
        }

        const { nodes: layoutedNodes } = layoutHierarchy(
          currentNodes,
          currentEdges,
        );
        setNodes(layoutedNodes);
        setEdges(currentEdges);
        setExpandedIds(newExpanded);
        setHighlightedId(result.id);

        requestAnimationFrame(() => {
          fitView({
            nodes: [{ id: String(result.id) }],
            duration: 500,
            padding: 1.5,
          });
        });

        setTimeout(() => setHighlightedId(null), 2500);
      } catch (error: any) {
        errorToast(
          error?.response?.data?.message ??
            "No se pudo llegar hasta esa persona",
        );
      } finally {
        setIsNavigating(false);
      }
    },
    [root.id, nodes, edges, expandedIds, expandNode, setNodes, setEdges, fitView],
  );

  // Inicializar el árbol con el nodo raíz (el usuario logueado)
  useEffect(() => {
    const rootNode = buildNode(root, true);
    const { nodes: layouted } = layoutHierarchy([rootNode], []);
    setNodes(layouted);
    setEdges([]);
    setExpandedIds(new Set());
    setLoadingIds(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root.id]);

  // Inyectar callbacks/estado actualizados en cada nodo sin recalcular layout
  const decoratedNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isExpanded: expandedIds.has(Number(node.id)),
          isLoadingChildren: loadingIds.has(Number(node.id)),
          isHighlighted: highlightedId === Number(node.id),
          onConsult: handleConsult,
          onExpand: handleExpand,
        },
      })),
    [
      nodes,
      expandedIds,
      loadingIds,
      highlightedId,
      handleConsult,
      handleExpand,
    ],
  );

  return (
    <div className={cn("relative", className)}>
      <TeamHierarchySearch
        rootId={root.id}
        onSelect={goToSearchResult}
        isNavigating={isNavigating}
      />
      <ReactFlow
        nodes={decoratedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

interface TeamHierarchySearchProps {
  rootId: number;
  onSelect: (result: WorkerHierarchySearchResult) => void;
  isNavigating: boolean;
}

function TeamHierarchySearch({
  rootId,
  onSelect,
  isNavigating,
}: TeamHierarchySearchProps) {
  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setDebouncedTerm(term);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [term]);

  const { data: results = [], isFetching } = useSearchHierarchy(
    rootId,
    debouncedTerm,
  );

  const showDropdown = isOpen && term.trim().length >= 2;

  return (
    <div className="absolute left-3 top-3 z-10 w-72">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar persona en el equipo..."
          className="h-10 bg-card pl-9 pr-9 shadow-md"
          disabled={isNavigating}
        />
        {term ? (
          <button
            type="button"
            onClick={() => {
              setTerm("");
              setDebouncedTerm("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {isNavigating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <X className="size-4" />
            )}
          </button>
        ) : null}
      </div>

      {showDropdown && (
        <div className="mt-1 max-h-72 overflow-y-auto rounded-lg bg-card shadow-lg">
          {isFetching ? (
            <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Buscando...
            </div>
          ) : results.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">
              Sin resultados para "{term}"
            </div>
          ) : (
            results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => {
                  onSelect(result);
                  setIsOpen(false);
                }}
                disabled={isNavigating}
                className={cn(
                  "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm",
                  "hover:bg-accent hover:text-accent-foreground transition-colors",
                )}
              >
                <span className="font-medium leading-tight">
                  {result.name}
                </span>
                {result.position && (
                  <span className="text-xs text-muted-foreground">
                    {result.position}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function TeamHierarchyTree(props: TeamHierarchyTreeProps) {
  return (
    <ReactFlowProvider>
      <TeamHierarchyTreeInner {...props} />
    </ReactFlowProvider>
  );
}
