"use client";

import { Badge, type BadgeColor } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Pencil,
  Trash2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { getContactIcon } from "../lib/opportunities.constants";
import { OpportunityActionResource } from "../lib/opportunityAction.interface";
import { parse } from "date-fns";

const CONTACT_TYPE_COLOR: Record<string, BadgeColor> = {
  EMAIL: "blue",
  TELEFONO: "green",
  REUNION: "purple",
  VIDEOLLAMADA: "indigo",
  WHATSAPP: "teal",
};

const CONTACT_TYPE_DOT: Record<string, string> = {
  EMAIL: "bg-blue-500",
  TELEFONO: "bg-green-500",
  REUNION: "bg-purple-500",
  VIDEOLLAMADA: "bg-indigo-500",
  WHATSAPP: "bg-teal-500",
};

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
      <div className="text-center py-8 text-muted-foreground">
        No hay acciones registradas
      </div>
    );
  }

  const sortedActions = [...actions].sort(
    (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
  );

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-4">
        {sortedActions.map((action) => {
          const date = parse(
            action.datetime,
            "yyyy-MM-dd HH:mm:ss",
            new Date(),
          );
          const dateStr = date.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const timeStr = date.toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const IconComponent = getContactIcon(action.action_contact_type);
          const dotClass =
            CONTACT_TYPE_DOT[action.action_contact_type] ?? "bg-primary";
          const contactColor: BadgeColor =
            CONTACT_TYPE_COLOR[action.action_contact_type] ?? "default";

          return (
            <div key={action.id} className="relative pl-12">
              {/* Timeline dot */}
              <div
                className={`absolute left-0 top-3 p-2 rounded-full border-4 border-background shadow-sm z-10 ${dotClass}`}
              >
                <IconComponent className="size-4 text-white" />
              </div>

              <Card className="hover:shadow-md transition-shadow py-0">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          color={contactColor}
                          icon={IconComponent as LucideIcon}
                        >
                          {action.action_contact_type}
                        </Badge>
                        <Badge
                          color={action.result ? "green" : "red"}
                          icon={action.result ? CheckCircle2 : XCircle}
                        >
                          {action.result ? "Exitosa" : "Sin resultado"}
                        </Badge>
                      </div>

                      {/* Action type */}
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {action.action_type}
                      </p>

                      {/* Description */}
                      <p className="text-sm text-foreground leading-relaxed">
                        {action.description}
                      </p>

                      {/* Date / time */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>{dateStr}</span>
                        <span className="text-border">·</span>
                        <span>{timeStr}</span>
                      </div>
                    </div>

                    {/* Edit / delete */}
                    {!isReadOnly && (
                      <div className="flex gap-1 shrink-0">
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => onEdit(action)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => onDelete(action.id)}
                          >
                            <Trash2 className="size-3.5" />
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
