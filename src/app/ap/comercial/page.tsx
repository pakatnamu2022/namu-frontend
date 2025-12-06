"use client";

import { DailyDeliveryDashboard } from "@/features/ap/comercial/daily-delivery";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { useNavigate } from "react-router-dom";

export default function CommercialDashboard() {
  const router = useNavigate();
  const { canView } = useModulePermissions("comercial");
  // Show Daily Delivery Dashboard as the default view for Comercial

  if (!canView) {
    router("")
  }

  return <DailyDeliveryDashboard />;
}
