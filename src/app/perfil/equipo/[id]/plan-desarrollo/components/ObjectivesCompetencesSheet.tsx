"use client";

import GeneralSheet from "@/shared/components/GeneralSheet";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Award } from "lucide-react";

interface ObjectivesCompetencesSheetProps {
  open: boolean;
  onClose: () => void;
  personId: number;
}

export default function ObjectivesCompetencesSheet({
  open,
  onClose,
  personId,
}: ObjectivesCompetencesSheetProps) {
  console.log("Person ID:", personId);
  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Mis Objetivos y/o Competencias"
      className="max-w-4xl!"
    >
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground space-y-4">
              <div className="flex justify-center gap-4">
                <Target className="w-12 h-12 opacity-50" />
                <Award className="w-12 h-12 opacity-50" />
              </div>
              <div>
                <p className="text-lg font-medium">Sección en Desarrollo</p>
                <p className="text-sm mt-2">
                  Aquí podrás agregar y asociar tus objetivos y competencias al
                  plan de desarrollo.
                </p>
                <p className="text-xs mt-4 text-muted-foreground/70">
                  Esta funcionalidad estará disponible próximamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </GeneralSheet>
  );
}
