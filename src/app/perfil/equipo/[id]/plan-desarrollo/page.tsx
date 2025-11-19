"use client";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DevelopmentPlanList from "./components/DevelopmentPlanList";

export default function PlanDesarrolloPage() {
  const { id } = useParams();
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const personId = Number(id);

  const handleBack = () => {
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("search") || "";
    const per_page = searchParams.get("per_page") || "";

    const params = new URLSearchParams();
    if (page !== "1") params.set("page", page);
    if (search) params.set("search", search);
    if (per_page) params.set("per_page", per_page);

    const queryString = params.toString();
    router(
      `/perfil/equipo/${personId}/historial${
        queryString ? `?${queryString}` : ""
      }`
    );
  };

  return (
    <div className="w-full py-4">
      <Card className="border-none shadow-none">
        <CardContent className="mx-auto max-w-7xl">
          <CardHeader className="space-y-4 p-0 mb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Planes de Desarrollo</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    router(`/perfil/equipo/${personId}/plan-desarrollo/crear`)
                  }
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear Plan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Volver
                </Button>
              </div>
            </div>
          </CardHeader>

          <DevelopmentPlanList personId={personId} />
        </CardContent>
      </Card>
    </div>
  );
}
