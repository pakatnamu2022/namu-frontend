"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookmarkPlus,
  Bug,
  CheckSquare,
  CornerDownRight,
  Minus,
  Zap,
} from "lucide-react";
import {
  ScrumItemType,
  ScrumItemPriority,
  ScrumKanbanItem,
} from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";

export const TYPE_ICON: Record<ScrumItemType, React.FC<any>> = {
  tarea: CheckSquare,
  historia: BookmarkPlus,
  funcion: Zap,
  solicitud: AlertTriangle,
  error: Bug,
};

export const TYPE_COLOR: Record<ScrumItemType, string> = {
  tarea: "text-slate-500",
  historia: "text-blue-600",
  funcion: "text-emerald-600",
  solicitud: "text-amber-600",
  error: "text-red-600",
};

export const PRIORITY_ICON: Record<ScrumItemPriority, React.FC<any>> = {
  alta: ArrowUp,
  media: Minus,
  baja: ArrowDown,
};

export const PRIORITY_COLOR: Record<ScrumItemPriority, string> = {
  alta: "text-red-500",
  media: "text-amber-500",
  baja: "text-blue-400",
};

interface ItemCardProps {
  item: ScrumKanbanItem;
  onClick: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const TypeIcon = TYPE_ICON[item.type as ScrumItemType] ?? Zap;
  const typeColor = TYPE_COLOR[item.type as ScrumItemType] ?? TYPE_COLOR.tarea;
  const priority = item.priority as ScrumItemPriority | undefined;
  const PriorityIcon = priority ? PRIORITY_ICON[priority] : null;
  const hasFooter =
    (item.story_points !== undefined && item.story_points !== null) ||
    !!item.assignee;

  return (
    <div className="flex flex-col gap-1" onClick={onClick} data-scrum-item>
      {item.parent && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <CornerDownRight className="size-2.5 shrink-0" />
          <span className="truncate">{item.parent.title}</span>
        </div>
      )}

      <div className="flex items-start gap-1.5">
        <TypeIcon className={cn("size-3.5 shrink-0 mt-0.5", typeColor)} />
        <p className="text-sm font-medium leading-snug line-clamp-2 flex-1 min-w-0">
          {item.title}
        </p>
        {PriorityIcon && priority && (
          <PriorityIcon
            className={cn("size-3.5 shrink-0 mt-0.5", PRIORITY_COLOR[priority])}
          />
        )}
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 3).map((tag) => (
            <Badge key={tag.id} size="xxs" variant="default" color={tag.color}>
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {hasFooter && (
        <div className="flex items-center justify-between gap-2">
          {item.story_points !== undefined && item.story_points !== null ? (
            <Badge
              variant="default"
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
            >
              {item.story_points}p
            </Badge>
          ) : (
            <span />
          )}
          {item.assignee && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="size-5 shrink-0 cursor-default">
                    <AvatarFallback className="text-[9px] font-medium bg-primary/10 text-primary">
                      {item.assignee.name
                        .split(" ")
                        .slice(0, 2)
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {item.assignee.name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>
  );
}
