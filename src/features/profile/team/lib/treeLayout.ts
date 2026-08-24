import dagre from "@dagrejs/dagre";
import { Edge, Node, Position } from "@xyflow/react";

export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 88;

/**
 * Recalcula la posición de todos los nodos/edges del árbol usando dagre
 * (layout jerárquico de izquierda a derecha).
 */
export function layoutHierarchy<T extends Node>(
  nodes: T[],
  edges: Edge[],
): { nodes: T[]; edges: Edge[] } {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: "LR",
    nodesep: 32,
    ranksep: 120,
  });

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const { x, y } = graph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      position: {
        x: x - NODE_WIDTH / 2,
        y: y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
