"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getContactIcon,
  OPPORTUNITIES,
} from "@/features/ap/comercial/oportunidades/lib/opportunities.constants";

const { ABSOLUTE_ROUTE } = OPPORTUNITIES;

interface AgendaActionCardProps {
  action: any;
}

export default function AgendaActionCard({ action }: AgendaActionCardProps) {
  const time = new Date(action.datetime).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const IconComponent = getContactIcon(action.action_contact_type);

  return (
    <Link to={`${ABSOLUTE_ROUTE}/${action.opportunity_id}`}>
      <div className="relative pl-12">
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

        <Card className={`hover:shadow-md transition-shadow`}>
          <CardContent>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Clock className="size-4 text-gray-500" />
                <span className="font-semibold">{time}</span>
                <Badge
                  variant="outline"
                  className={
                    action.result
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-red-100 text-red-800 border-red-300"
                  }
                >
                  {action.result ? (
                    <>
                      <CheckCircle2 className="size-3 mr-1" />
                      Exitosa
                    </>
                  ) : (
                    <>
                      <Circle className="size-3 mr-1" />
                      Sin resultado
                    </>
                  )}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {action.action_contact_type}
                </Badge>
              </div>

              {action.client && (
                <div className="text-sm text-gray-600">
                  Cliente: <span className="font-medium">{action.client}</span>
                </div>
              )}

              <p className="text-sm text-gray-700 line-clamp-2">
                {action.description}
              </p>

              {/* <Link to={`${ABSOLUTE_ROUTE}/${action.opportunity_id}`}>
              <Button variant="link" size="sm" className="h-7 px-0">
                Ver Oportunidad
                <ExternalLink className="size-3 ml-1" />
              </Button>
            </Link> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}
