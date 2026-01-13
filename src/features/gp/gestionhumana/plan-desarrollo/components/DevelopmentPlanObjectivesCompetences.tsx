"use client";

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Target, Award, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { SelectedItem } from "./ObjectivesCompetencesSheet";

interface DevelopmentPlanObjectivesCompetencesProps {
  form: UseFormReturn<any>;
  selectedItems: SelectedItem[];
  onOpenSheet: () => void;
  onRemoveItem: (id: number, type: "objective" | "competence") => void;
}

export default function DevelopmentPlanObjectivesCompetences({
  form,
  selectedItems,
  onOpenSheet,
  onRemoveItem,
}: DevelopmentPlanObjectivesCompetencesProps) {
  const noAssociateValue = form.watch("noAssociate");

  return (
    <GroupFormSection
      title="¿Qué trabajará este plan?"
      icon={Target}
      cols={{ sm: 1, md: 1, lg: 1 }}
    >
      <div className="space-y-4">
        <FormSwitch
          control={form.control}
          name="noAssociate"
          text="No asociar a mis objetivos y/o competencias"
          autoHeight
        />

        {!noAssociateValue && (
          <div className="space-y-4 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenSheet}
              className="w-full"
            >
              <Plus className="w-3 h-3 mr-2" />
              Agregar Mis Objetivos y/o Competencias
            </Button>

            {/* Lista de items seleccionados */}
            {selectedItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">
                  Seleccionados ({selectedItems.length})
                </h4>

                {/* Objetivos */}
                {selectedItems.some((item) => item.type === "objective") && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Target className="w-4 h-4" />
                      Objetivos
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedItems
                        .filter((item) => item.type === "objective")
                        .map((item) => (
                          <Badge
                            key={`${item.type}-${item.id}`}
                            variant="default"
                            className="pr-1"
                          >
                            <span className="mr-1">{item.title}</span>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id, item.type)}
                              className="ml-1 hover:bg-muted rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {/* Competencias */}
                {selectedItems.some((item) => item.type === "competence") && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Award className="w-4 h-4" />
                      Competencias
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedItems
                        .filter((item) => item.type === "competence")
                        .map((item) => (
                          <Badge
                            key={`${item.type}-${item.id}`}
                            variant="default"
                            className="pr-1"
                          >
                            <span className="mr-1">{item.title}</span>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id, item.type)}
                              className="ml-1 hover:bg-muted rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </GroupFormSection>
  );
}
