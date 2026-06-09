"use client";

import { useNavigate } from "react-router-dom";
import { INSURANCE } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.constant";
import { notFound } from "@/shared/hooks/useNotFound";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect } from "react";

export default function UpdateInsurancePage() {
  const { ABSOLUTE_ROUTE, ROUTE } = INSURANCE;
  const router = useNavigate();
  const { checkRouteExists } = useCurrentModule();

  useEffect(() => {
    router(ABSOLUTE_ROUTE);
  }, []);

  if (!checkRouteExists(ROUTE)) notFound();

  return null;
}
