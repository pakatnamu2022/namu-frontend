"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PlayCircle, PauseCircle, CheckCircle } from "lucide-react";
import { WorkOrderPlanningResource } from "../lib/workOrderPlanning.interface";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  pauseWorkSchema,
  PauseWorkFormValues,
} from "../lib/workOrderPlanning.schema";
import { useState } from "react";

interface SessionActionsProps {
  planning: WorkOrderPlanningResource;
  onStart: (notes?: string) => void;
  onPause: (reason?: string) => void;
  onComplete: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SessionActions({
  planning,
  onStart,
  onPause,
  onComplete,
  isLoading,
}: SessionActionsProps) {
  const [openStartAlert, setOpenStartAlert] = useState(false);
  const [openCompleteAlert, setOpenCompleteAlert] = useState(false);
  const [openPauseDialog, setOpenPauseDialog] = useState(false);

  const pauseForm = useForm<PauseWorkFormValues>({
    resolver: zodResolver(pauseWorkSchema),
    defaultValues: {
      pause_reason: "",
    },
  });

  const handleStartConfirm = () => {
    onStart();
    setOpenStartAlert(false);
  };

  const handlePause = (data: PauseWorkFormValues) => {
    onPause(data.pause_reason);
    setOpenPauseDialog(false);
    pauseForm.reset();
  };

  const handleCompleteConfirm = () => {
    onComplete();
    setOpenCompleteAlert(false);
  };

  // Lógica de estados según requerimientos
  const showStart = planning.status === "planned";
  const showPauseAndComplete = planning.status === "in_progress";

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Botón Iniciar - Solo cuando está en estado "planned" */}
      {showStart && (
        <>
          <Button
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={() => setOpenStartAlert(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <PlayCircle className="h-4 w-4 mr-1" />
            Iniciar
          </Button>

          <AlertDialog open={openStartAlert} onOpenChange={setOpenStartAlert}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Iniciar trabajo?</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de iniciar este trabajo? El estado cambiará a
                  &quot;En Progreso&quot;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleStartConfirm}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Sí, Iniciar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {/* Botones Pausar y Completar - Solo cuando está en estado "in_progress" */}
      {showPauseAndComplete && (
        <>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => setOpenPauseDialog(true)}
            className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
          >
            <PauseCircle className="h-4 w-4 mr-1" />
            Pausar
          </Button>

          <Button
            variant="default"
            size="sm"
            disabled={isLoading}
            onClick={() => setOpenCompleteAlert(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Completar
          </Button>

          {/* Dialog para Pausar - Requiere razón */}
          <Dialog open={openPauseDialog} onOpenChange={setOpenPauseDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pausar Trabajo</DialogTitle>
                <DialogDescription>
                  Ingresa la razón por la cual se está pausando este trabajo.
                </DialogDescription>
              </DialogHeader>
              <Form {...pauseForm}>
                <form
                  onSubmit={pauseForm.handleSubmit(handlePause)}
                  className="space-y-4"
                >
                  <FormField
                    control={pauseForm.control}
                    name="pause_reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón de Pausa</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: Esperando repuesto del almacén..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOpenPauseDialog(false);
                        pauseForm.reset();
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Pausar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Alert para Completar */}
          <AlertDialog
            open={openCompleteAlert}
            onOpenChange={setOpenCompleteAlert}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Completar trabajo?</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de marcar este trabajo como completado? Esta
                  acción cambiará el estado a &quot;Completado&quot;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCompleteConfirm}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Sí, Completar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
