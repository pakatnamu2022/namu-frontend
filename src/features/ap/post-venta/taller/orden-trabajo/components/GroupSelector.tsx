"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkOrderItemResource } from "../../orden-trabajo-item/lib/workOrderItem.interface";

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

  if (groups.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">No hay grupos disponibles</p>
          <p className="text-xs text-gray-400 mt-1">
            Agrega trabajos en la pestaña Apertura
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <h3 className="text-sm font-semibold">Seleccionar Grupo:</h3>
        <div className="flex gap-2 flex-wrap">
          {groups.map((groupNumber) => (
            <Button
              key={groupNumber}
              variant={selectedGroupNumber === groupNumber ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectGroup(groupNumber)}
            >
              Grupo {groupNumber}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
