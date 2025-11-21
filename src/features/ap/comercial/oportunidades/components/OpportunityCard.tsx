"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Car, IdCard, Phone, PanelRightClose } from "lucide-react";
import type { OpportunityResource } from "../lib/opportunities.interface";
import {
  HOVER_TEXT_OPPORTUNITY_STATUS_COLORS,
  OPPORTUNITIES,
  OPPORTUNITY_STATUS_COLORS,
  TEXT_OPPORTUNITY_STATUS_COLORS,
} from "../lib/opportunities.constants";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface OpportunityCardProps {
  opportunity: OpportunityResource;
  onClick?: () => void;
  disableClick?: boolean;
  showOpenButton?: boolean;
  noWrapper?: boolean; // For use inside KanbanCard which already has Card wrapper
}

const { ABSOLUTE_ROUTE } = OPPORTUNITIES;

export const OpportunityCard = ({
  opportunity,
  onClick,
  disableClick = false,
  showOpenButton = false,
  noWrapper = false,
}: OpportunityCardProps) => {
  const router = useNavigate();
  const statusColor =
    OPPORTUNITY_STATUS_COLORS[opportunity.opportunity_status] ||
    "bg-gray-500 text-white";

  const textColor =
    TEXT_OPPORTUNITY_STATUS_COLORS[opportunity.opportunity_status] ||
    "bg-gray-500 text-white";

  const hoverTextColor =
    HOVER_TEXT_OPPORTUNITY_STATUS_COLORS[opportunity.opportunity_status] ||
    "hover:text-gray-500 hover:bg-gray-500/5";

  const handleClick = (e: React.MouseEvent) => {
    if (disableClick) return;
    // Prevent card click when clicking the button
    if ((e.target as HTMLElement).closest("button")) {
      e.stopPropagation();
      return;
    }

    if (onClick) {
      onClick();
    } else {
      router(`/ap/comercial/oportunidades/${opportunity.id}`);
    }
  };

  const content = (
    <div className="w-full flex flex-col gap-1.5">
      {/* Client Name */}
      <div className="flex items-center gap-2">
        <User className={cn("size-4 text-muted-foreground", textColor)} />
        <p className="font-semibold text-sm truncate">
          {opportunity.client.full_name}
        </p>
      </div>

      {/* Family and Status */}
      <div className="flex items-start justify-between gap-2">
        {/* Vehice */}
        <div className="flex items-center gap-2">
          <Car className={cn("size-4 text-muted-foreground", textColor)} />
          <p className="font-medium text-sm truncate">
            {opportunity.family.brand} {opportunity.family.description}
          </p>
        </div>
      </div>

      {/* Client Phone */}
      <div className="flex items-center gap-2">
        <Phone className={cn("size-4 text-muted-foreground", textColor)} />
        <p className="font-medium text-sm truncate">
          {opportunity.client.phone}
        </p>
      </div>

      {/* Document & Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IdCard className={cn("size-4 text-muted-foreground", textColor)} />
          <p className="text-sm truncate">{opportunity.client.num_doc}</p>
        </div>

        {showOpenButton && (
          <Link
            to={`${ABSOLUTE_ROUTE}/${opportunity.id}`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-6 px-2 text-xs", hoverTextColor)}
              asChild
            >
              <span>
                <PanelRightClose className="size-3 mr-1" />
                Abrir
              </span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

  if (noWrapper) {
    return content;
  }

  return (
    <Card
      className={cn(
        `p-3 hover:shadow-sm transition-all border-gray-200 ${
          !disableClick ? "cursor-pointer" : ""
        }`,
        statusColor
      )}
      onClick={handleClick}
    >
      {content}
    </Card>
  );
};
