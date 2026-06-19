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
  const priority = item.priority as ScrumItemPriority | undefined;
  const PriorityIcon = priority ? PRIORITY_ICON[priority] : null;

  return (
    <div className="space-y-1.5" onClick={onClick}>
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center gap-1 min-w-0">
          <p className="text-xs font-medium line-clamp-2 leading-tight">
            {item.title}
          </p>
        </div>
        {PriorityIcon && priority && (
          <PriorityIcon
            className={cn("size-3 shrink-0 mt-0.5", PRIORITY_COLOR[priority])}
          />
        )}
      </div>

      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-[9px] px-1 py-0 h-3.5"
              style={
                tag.color
                  ? { borderColor: tag.color, color: tag.color }
                  : undefined
              }
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-1">
        {item.story_points !== undefined && item.story_points !== null && (
          <Badge variant="ghost" className="text-[9px] px-1 py-0 h-3.5">
            {item.story_points}p
          </Badge>
        )}
        <TypeIcon className="size-4 text-muted-foreground shrink-0" />
        {item.assignee && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="size-6 ml-auto shrink-0 cursor-default">
                  <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
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
    </div>
  );
}
