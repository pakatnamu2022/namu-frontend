"use client";

import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { CAMPAIGN_SCHEDULE } from "../lib/campaignSchedule.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function CampaignScheduleActions({ permissions }: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = CAMPAIGN_SCHEDULE;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router(ROUTE_ADD!)}
      >
        <CalendarDays className="size-4 mr-2" /> Gestionar Cronograma
      </Button>
    </ActionsWrapper>
  );
}
