"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { getContactIcon } from "../lib/opportunities.constants";
import { OpportunityActionResource } from "../lib/opportunityAction.interface";
import { parse } from "date-fns";

interface OpportunityActionTimelineProps {
  actions: OpportunityActionResource[];
  onEdit?: (action: OpportunityActionResource) => void;
  onDelete?: (actionId: number) => void;
  isReadOnly?: boolean;
}

export const OpportunityActionTimeline = ({
  actions,
  onEdit,
  onDelete,
  isReadOnly = false,
}: OpportunityActionTimelineProps) => {
  if (!actions || actions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay acciones registradas
      </div>
    );
  }

  // Sort actions by date (most recent first)
  const sortedActions = [...actions].sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
  );

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {sortedActions.map((action) => {
          const date = parse(
            action.datetime,
            "yyyy-MM-dd HH:mm:ss",
            new Date(),
          );
          const dateStr = date.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          const timeStr = date.toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          const IconComponent = getContactIcon(action.action_contact_type);

          return (
            <div key={action.id} className="relative pl-12">
              {/* Timeline icon - positioned on the line */}
              <div
                className={`absolute left-0 top-0 p-2 rounded-full border-4 border-background shadow-sm z-10 ${
                  action.result ? "bg-primary" : "bg-red-500"
                }`}
              >
                <IconComponent
                  className={`size-5 ${
                    action.result ? "text-primary-foreground" : "text-red-50"
                  }`}
                />
              </div>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:pt-4">
                  <div className="flex flex-col md:flex-row items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                        <span className="font-semibold text-sm">
                          {dateStr} - {timeStr}
                        </span>
                        <Badge variant="outline">
                          {action.action_contact_type}
                        </Badge>
                        <Badge
                          color={action.result ? "default" : "destructive"}
                          className="text-xs"
                          variant="outline"
                        >
                          {action.result ? "Exitosa" : "Sin resultado"}
                        </Badge>
                      </div>

                      <div className="text-xs md:text-sm text-gray-500">
                        {action.action_type}
                      </div>

                      <div className="flex items-start gap-2">
                        <p className="text-gray-700 flex-1 text-sm md:text-base">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    {!isReadOnly && (
                      <div className="flex gap-2 ml-4">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(action)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(action.id)}
                          >
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
