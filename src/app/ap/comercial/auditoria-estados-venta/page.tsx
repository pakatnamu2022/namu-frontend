"use client";

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { TICS_ROLE } from "@/features/gp/gestionsistema/roles/lib/role.constants";
import { VehicleSaleAuditView } from "@/features/ap/comercial/vehicle-sale-audit";

export default function VehicleSaleAuditPage() {
  const { user } = useAuthStore();

  if (user?.role_id !== TICS_ROLE) return <Navigate to="/companies" replace />;

  return <VehicleSaleAuditView />;
}
