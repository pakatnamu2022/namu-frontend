"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useWorkersWithoutObjectives,
  useWorkersWithoutCategories,
  useWorkersWithoutCompetences,
} from "@/src/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";
import WorkerTable from "./WorkerTable";
import FormSkeleton from "@/src/shared/components/FormSkeleton";

interface WorkersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WorkersModal({
  open,
  onOpenChange,
}: WorkersModalProps) {
  const [activeTab, setActiveTab] = useState("objectives");

  const {
    data: workersWithoutObjectives,
    isLoading: loadingObjectives,
    refetch: refetchObjectives,
  } = useWorkersWithoutObjectives();

  const {
    data: workersWithoutCategories,
    isLoading: loadingCategories,
    refetch: refetchCategories,
  } = useWorkersWithoutCategories();

  const {
    data: workersWithoutCompetences,
    isLoading: loadingCompetences,
    refetch: refetchCompetences,
  } = useWorkersWithoutCompetences();

  useEffect(() => {
    if (open) {
      refetchObjectives();
      refetchCategories();
      refetchCompetences();
      setActiveTab("objectives");
    }
  }, [open]);

  const isLoading =
    loadingObjectives || loadingCategories || loadingCompetences;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full overflow-auto !max-w-(--breakpoint-xl)">
        <DialogHeader>
          <DialogTitle>Trabajadores Faltantes</DialogTitle>
        </DialogHeader>

        {!isLoading ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="objectives">
                Sin Objetivos ({workersWithoutObjectives?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="categories">
                Sin Categorías ({workersWithoutCategories?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="competences">
                Sin Competencias ({workersWithoutCompetences?.length || 0})
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 max-h-[60vh] overflow-auto">
              <TabsContent value="objectives" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Trabajadores que no tienen objetivos asignados
                </div>
                <WorkerTable
                  workers={workersWithoutObjectives || []}
                  isLoading={loadingObjectives}
                />
              </TabsContent>

              <TabsContent value="categories" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Trabajadores que no tienen categorías asignadas
                </div>
                <WorkerTable
                  workers={workersWithoutCategories || []}
                  isLoading={loadingCategories}
                />
              </TabsContent>

              <TabsContent value="competences" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Trabajadores que no tienen competencias asignadas
                </div>
                <WorkerTable
                  workers={workersWithoutCompetences || []}
                  isLoading={loadingCompetences}
                />
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <FormSkeleton />
        )}
      </DialogContent>
    </Dialog>
  );
}
