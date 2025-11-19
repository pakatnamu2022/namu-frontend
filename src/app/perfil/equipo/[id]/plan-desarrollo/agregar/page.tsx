"use client";

import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DevelopmentPlanForm from "../../../../../../features/gp/gestionhumana/plan-desarrollo/components/DevelopmentPlanForm";
import { useAuthStore } from "@/features/auth/lib/auth.store";

export default function CrearPlanDesarrolloPage() {
  const { id } = useParams();
  const router = useNavigate();
  const personId = Number(id);
  const currentUser = useAuthStore((state) => state.user);
  const bossId = currentUser?.partner_id;

  const handleBack = () => {
    router(`/perfil/equipo/${personId}/plan-desarrollo`);
  };

  const handleSuccess = () => {
    // Al guardar exitosamente, redirigir a la lista
    router(`/perfil/equipo/${personId}/plan-desarrollo`);
  };

  return (
    <div className="w-full py-4">
      <Card className="border-none shadow-none">
        <CardContent className="mx-auto max-w-7xl">
          <CardHeader className="space-y-4 p-0 mb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                Crear Plan de Desarrollo
              </CardTitle>
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
          </CardHeader>

          <DevelopmentPlanForm
            personId={personId}
            bossId={bossId}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>
    </div>
  );
}
