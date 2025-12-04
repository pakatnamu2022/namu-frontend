"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WorkOrderItemResource } from "../../orden-trabajo-item/lib/workOrderItem.interface";
import { DEFAULT_GROUP_COLOR, GROUP_COLORS } from "../lib/workOrder.interface";
import { Layers } from "lucide-react";

const getGroupColor = (groupNumber: number) => {
  return GROUP_COLORS[groupNumber] || DEFAULT_GROUP_COLOR;
};

interface GroupSelectorProps {
  items: WorkOrderItemResource[];
  selectedGroupNumber: number | null;
  onSelectGroup: (groupNumber: number) => void;
}

export default function GroupSelector({
  items,
  selectedGroupNumber,
  onSelectGroup,
}: GroupSelectorProps) {
  // Agrupar items por número de grupo
  const groupedItems = items.reduce((acc, item) => {
    const key = item.group_number;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<number, WorkOrderItemResource[]>);

  const groups = Object.keys(groupedItems)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Card className="p-4 h-fit sticky top-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Grupos</h3>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No hay grupos disponibles</p>
          <p className="text-xs text-gray-400 mt-1">
            Agrega trabajos en la pestaña Apertura
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((groupNumber) => {
            const groupItems = groupedItems[groupNumber];
            const colors = getGroupColor(groupNumber);
            const isSelected = selectedGroupNumber === groupNumber;

            return (
              <button
                key={groupNumber}
                onClick={() => onSelectGroup(groupNumber)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border-2 transition-all",
                  "hover:border-gray-400 hover:shadow-sm",
                  isSelected
                    ? "border-gray-800 bg-gray-50 shadow-md"
                    : "border-gray-200 bg-white"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    className="text-white"
                    style={{ backgroundColor: colors.badge }}
                  >
                    Grupo {groupNumber}
                  </Badge>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  {groupItems.length} trabajo
                  {groupItems.length !== 1 ? "s" : ""}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
