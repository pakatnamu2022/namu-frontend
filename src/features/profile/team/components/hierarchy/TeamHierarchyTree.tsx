import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { errorToast } from "@/core/core.function";
import { WorkerHierarchyNode } from "../../lib/team-hierarchy.interface";
import { useExpandHierarchyNode } from "../../lib/team-hierarchy.hook";
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
  const expandNode = useExpandHierarchyNode();

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
    [expandedIds, expandNode, edges, nodes, setEdges, setNodes],
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
          onConsult: handleConsult,
          onExpand: handleExpand,
        },
      })),
    [nodes, expandedIds, loadingIds, handleConsult, handleExpand],
  );

  return (
    <div className={className}>
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
        <MiniMap pannable zoomable className="hidden md:block" />
      </ReactFlow>
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
