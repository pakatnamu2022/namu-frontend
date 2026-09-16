"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { errorToast, successToast } from "@/core/core.function";
import { RECRUITMENT_PROCESS } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.constant";
import { useProcessStageMessages } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/processStageMessage.hook";
import { updateProcessStageMessage } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/processStageMessage.actions";
import { ProcessStageMessageResource } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/processStageMessage.interface";
import { MessageTemplateSchema } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/messageTemplate.schema";
import MessageTemplateEditDialog from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/MessageTemplateEditDialog";

export default function ProcessStageMessagesPage() {
  const { ROUTE, ABSOLUTE_ROUTE } = RECRUITMENT_PROCESS;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { data, isLoading, refetch } = useProcessStageMessages();
  const [editRow, setEditRow] = useState<ProcessStageMessageResource | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (values: MessageTemplateSchema) => {
    if (!editRow) return;
    setSaving(true);
    try {
      await updateProcessStageMessage(editRow.etapa, values);
      await refetch();
      successToast("Mensaje actualizado correctamente.");
      setEditRow(null);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo actualizar el mensaje.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Mensajes por etapa del proceso"
          subtitle="Correos automáticos enviados al cliente interno / jefatura solicitante"
          icon="Send"
          backRoute={ABSOLUTE_ROUTE}
        />
      </HeaderTableWrapper>

      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(data ?? []).map((item) => (
            <div
              key={item.etapa}
              className="border rounded-md p-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{item.label}</span>
                  <Badge color={item.activo ? "green" : "gray"}>
                    {item.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {item.asunto || "Sin asunto configurado"}
                </p>
              </div>
              <Button variant="outline" size="icon" className="size-7 shrink-0" onClick={() => setEditRow(item)}>
                <Pencil className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <MessageTemplateEditDialog
        open={editRow !== null}
        title="Editar mensaje al solicitante"
        subtitle={editRow?.label}
        defaultValues={{
          asunto: editRow?.asunto ?? "",
          contenido: editRow?.contenido ?? "",
          activo: editRow?.activo ?? false,
        }}
        onOpenChange={(open) => !open && setEditRow(null)}
        onConfirm={handleSave}
        isLoading={saving}
      />
    </div>
  );
}
