import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { ChevronRight, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WorkerHierarchyNode } from "../../lib/team-hierarchy.interface";

export interface TeamHierarchyNodeData {
  worker: WorkerHierarchyNode;
  isRoot: boolean;
  isExpanded: boolean;
  isLoadingChildren: boolean;
  isHighlighted?: boolean;
  onConsult: (id: number) => void;
  onExpand: (id: number) => void;
  [key: string]: unknown;
}

export type TeamHierarchyFlowNode = Node<TeamHierarchyNodeData, "teamMember">;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function TeamHierarchyNode({
  data,
}: NodeProps<TeamHierarchyFlowNode>) {
  const {
    worker,
    isRoot,
    isExpanded,
    isLoadingChildren,
    isHighlighted,
    onConsult,
    onExpand,
  } = data;

  return (
    <div
      className={cn(
        "w-[240px] rounded-xl bg-card shadow-md hover:shadow-lg transition-shadow",
        "flex flex-col items-center gap-2 p-4 cursor-pointer",
        isRoot && "ring-2 ring-primary",
        isHighlighted && "ring-2 ring-amber-400 shadow-lg scale-[1.03]",
      )}
      onClick={() => onConsult(worker.id)}
    >
      {!isRoot && <Handle type="target" position={Position.Left} />}

      <Avatar className="size-14">
        <AvatarImage src={worker.photo ?? undefined} alt={worker.name} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {worker.name ? getInitials(worker.name) : <User className="size-5" />}
        </AvatarFallback>
      </Avatar>

      <div className="text-center">
        <p className="text-sm font-semibold leading-tight">{worker.name}</p>
        {worker.position && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {worker.position}
          </p>
        )}
      </div>

      {worker.has_subordinates && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExpand(worker.id);
          }}
          disabled={isLoadingChildren}
          className={cn(
            "flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground",
            "hover:bg-accent hover:text-accent-foreground transition-colors",
          )}
        >
          {isLoadingChildren ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ChevronRight
              className={cn(
                "size-3.5 transition-transform",
                isExpanded && "rotate-180",
              )}
            />
          )}
        </button>
      )}

      {worker.has_subordinates && (
        <Handle type="source" position={Position.Right} />
      )}
    </div>
  );
}
