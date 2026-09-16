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
import { useApplicantStatusMessages } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/applicantStatusMessage.hook";
import { updateApplicantStatusMessage } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/applicantStatusMessage.actions";
import { ApplicantStatusMessageResource } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/applicantStatusMessage.interface";
import { MessageTemplateSchema } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/messageTemplate.schema";
import MessageTemplateEditDialog from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/components/MessageTemplateEditDialog";

export default function ApplicantStatusMessagesPage() {
  const { ROUTE, ABSOLUTE_ROUTE } = RECRUITMENT_PROCESS;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { data, isLoading, refetch } = useApplicantStatusMessages();
  const [editRow, setEditRow] = useState<ApplicantStatusMessageResource | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (values: MessageTemplateSchema) => {
    if (!editRow) return;
    setSaving(true);
    try {
      await updateApplicantStatusMessage(editRow.tipo_trabajador_id, values);
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
          title="Mensajes por estado del postulante"
          subtitle="Correos automáticos enviados al postulante al cambiar su estado"
          icon="Mail"
          backRoute={ABSOLUTE_ROUTE}
        />
      </HeaderTableWrapper>

      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(data ?? []).map((item) => (
            <div
              key={item.tipo_trabajador_id}
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
        title="Editar mensaje al postulante"
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
