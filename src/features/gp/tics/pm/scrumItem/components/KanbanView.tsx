"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
  type DragEndEvent,
} from "@/shared/components/kanban";
import { ScrumKanbanItem } from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";
import { ItemCard } from "./ItemCard";

export type KanbanStatus =
  | "backlog"
  | "por_hacer"
  | "en_progreso"
  | "en_revision"
  | "hecho";

const KANBAN_COLUMNS = [
  { id: "backlog", name: "Backlog", textColor: "text-slate-700", bgTextColor: "bg-slate-100" },
  { id: "por_hacer", name: "Por hacer", textColor: "text-blue-700", bgTextColor: "bg-blue-100" },
  { id: "en_progreso", name: "En progreso", textColor: "text-amber-700", bgTextColor: "bg-amber-100" },
  { id: "en_revision", name: "En revisión", textColor: "text-purple-700", bgTextColor: "bg-purple-100" },
  { id: "hecho", name: "Hecho", textColor: "text-emerald-700", bgTextColor: "bg-emerald-100" },
] as const;

interface KanbanViewProps {
  kanban: Record<KanbanStatus, ScrumKanbanItem[]> | undefined;
  isLoading: boolean;
  onItemClick: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
}

export function KanbanView({ kanban, isLoading, onItemClick, onStatusChange }: KanbanViewProps) {
  const allItems = kanban
    ? KANBAN_COLUMNS.flatMap(({ id: colId }) =>
        (kanban[colId] ?? []).map((item) => ({
          ...item,
          id: item.id.toString(),
          name: item.title,
          column: colId,
        })),
      )
    : [];

  const columnCount = (colId: string) => allItems.filter((i) => i.column === colId).length;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const dragged = allItems.find((i) => i.id === active.id);
    if (!dragged) return;
    let targetColumn = over.id as string;
    const overItem = allItems.find((i) => i.id === over.id);
    if (overItem) targetColumn = overItem.column;
    if (dragged.column === targetColumn) return;
    onStatusChange(Number(dragged.id), targetColumn);
  };

  return (
    <div className="flex-1 overflow-hidden overflow-x-auto">
      <KanbanProvider
        columns={KANBAN_COLUMNS as any}
        data={allItems as any}
        onDragEnd={handleDragEnd}
        className="h-full min-w-[750px] p-0.5"
      >
        {(column: (typeof KANBAN_COLUMNS)[number]) => (
          <KanbanBoard
            id={column.id}
            key={column.id}
            className="border-none shadow-none w-full min-w-64"
          >
            <KanbanHeader className="border-none">
              <div className="flex items-center justify-between">
                <Badge
                  variant="ghost"
                  className={cn("text-xs", column.textColor, column.bgTextColor)}
                >
                  {column.name}
                </Badge>
                <Badge variant="ghost" className="text-xs">
                  {columnCount(column.id)}
                </Badge>
              </div>
            </KanbanHeader>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <KanbanCards id={column.id}>
                {(item: any) => (
                  <KanbanCard
                    id={item.id}
                    key={item.id}
                    name={item.name}
                    column={item.column}
                    className="w-full bg-background cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <ItemCard
                      item={item as ScrumKanbanItem}
                      onClick={() => onItemClick(Number(item.id))}
                    />
                  </KanbanCard>
                )}
              </KanbanCards>
            )}
          </KanbanBoard>
        )}
      </KanbanProvider>
    </div>
  );
}
