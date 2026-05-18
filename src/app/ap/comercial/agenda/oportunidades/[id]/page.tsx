"use client";

import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  CircleX,
  NotebookText,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  User,
  Car,
  IdCard,
  Briefcase,
} from "lucide-react";
import { errorToast } from "@/core/core.function";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  useOpportunity,
  useOpportunityActions,
  useCreateOpportunityAction,
  useUpdateOpportunityAction,
  useDeleteOpportunityAction,
  useCloseOpportunity,
} from "@/features/ap/comercial/oportunidades/lib/opportunities.hook";
import { OpportunityActionTimeline } from "@/features/ap/comercial/oportunidades/components/OpportunityActionTimeline";
import { OpportunityActionForm } from "@/features/ap/comercial/oportunidades/components/OpportunityActionForm";
import {
  OPPORTUNITIES,
  OPPORTUNITY_STATUS_COLORS,
  STATUS_ID_TO_COLUMN,
  STATUS_ID_TO_LABEL,
  BG_TEXT_OPPORTUNITY,
  TEXT_OPPORTUNITY,
  BORDER_OPPORTUNITY,
} from "@/features/ap/comercial/oportunidades/lib/opportunities.constants";
import { GeneralModal } from "@/shared/components/GeneralModal";
import FormWrapper from "@/shared/components/FormWrapper";
import { OpportunityActionResource } from "@/features/ap/comercial/oportunidades/lib/opportunityAction.interface";
import { cn } from "@/lib/utils";
import EmptyModel from "@/shared/components/EmptyModel";
import { AGENDA } from "@/features/ap/comercial/agenda/lib/agenda.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useInvalidateQuery } from "@/core/core.hook";
import { Textarea } from "@/components/ui/textarea";
import { PURCHASE_REQUEST_QUOTE } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.constants";
import TitleFormComponent from "@/shared/components/TitleFormComponent";

const { ABSOLUTE_ROUTE, QUERY_KEY } = OPPORTUNITIES;
const { ABSOLUTE_ROUTE: AGENDA_ABSOLUTE_ROUTE } = AGENDA;
const { ROUTE_ADD: PURCHASE_REQUEST_QUOTE_ROUTE_ADD } = PURCHASE_REQUEST_QUOTE;

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useNavigate();
  const opportunityId = Number(params.id);

  const { data: opportunity, isLoading: isLoadingOpportunity } =
    useOpportunity(opportunityId);

  const { data: actions, isLoading: isLoadingActions } =
    useOpportunityActions(opportunityId);

  const [showActionForm, setShowActionForm] = useState(false);
  const [editingAction, setEditingAction] =
    useState<OpportunityActionResource | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeComment, setCloseComment] = useState("");

  const createActionMutation = useCreateOpportunityAction();
  const updateActionMutation = useUpdateOpportunityAction();
  const deleteActionMutation = useDeleteOpportunityAction();
  const closeOpportunityMutation = useCloseOpportunity();

  const isClosedOpportunity = opportunity?.is_closed;
  const invalidateQuery = useInvalidateQuery();

  const invalidateQueryId = () => {
    invalidateQuery([QUERY_KEY, opportunityId, "actions"]);
    invalidateQuery([QUERY_KEY, opportunityId]);
  };

  const handleCreateAction = (data: any) => {
    createActionMutation.mutate(data, {
      onSuccess: () => {
        setShowActionForm(false);
        setEditingAction(null);
        invalidateQueryId();
      },
    });
  };

  const handleUpdateAction = (data: any) => {
    if (!editingAction) return;
    updateActionMutation.mutate(
      { id: editingAction.id, data },
      {
        onSuccess: () => {
          setShowActionForm(false);
          setEditingAction(null);
          invalidateQueryId();
        },
      },
    );
  };

  const handleDeleteAction = (actionId: number) => {
    if (isClosedOpportunity) {
      errorToast("Esta oportunidad está cerrada. No se pueden eliminar acciones.");
      return;
    }
    deleteActionMutation.mutate(actionId);
  };

  const handleEditAction = (action: OpportunityActionResource) => {
    if (isClosedOpportunity) {
      errorToast("Esta oportunidad está cerrada. No se pueden actualizar acciones.");
      return;
    }
    setEditingAction(action);
    setShowActionForm(true);
  };

  const handleCloseOpportunity = () => {
    if (!closeComment.trim()) {
      errorToast("El comentario es obligatorio para cerrar la oportunidad");
      return;
    }
    closeOpportunityMutation.mutate(
      { id: opportunityId, comment: closeComment },
      {
        onSuccess: () => {
          router(`${ABSOLUTE_ROUTE}`);
          setShowCloseModal(false);
          setCloseComment("");
        },
      },
    );
  };

  if (isLoadingOpportunity || isLoadingActions) return <FormSkeleton />;
  if (!opportunity) return <EmptyModel route={`${AGENDA_ABSOLUTE_ROUTE}`} />;

  const statusKey =
    STATUS_ID_TO_COLUMN[opportunity.opportunity_status_id] ??
    opportunity.opportunity_status;
  const statusLabel =
    STATUS_ID_TO_LABEL[opportunity.opportunity_status_id] ??
    opportunity.opportunity_status;
  const statusColor =
    OPPORTUNITY_STATUS_COLORS[statusKey] || "bg-muted text-muted-foreground";
  const bgTextColor = BG_TEXT_OPPORTUNITY[statusKey] || "bg-muted/40";
  const textColor = TEXT_OPPORTUNITY[statusKey] || "text-foreground";
  const borderColor = BORDER_OPPORTUNITY[statusKey] || "border-muted";

  return (
    <FormWrapper>
      <HeaderTableWrapper>
        <TitleFormComponent
          title={opportunity.client.full_name}
          mode="edit"
          subtitle={opportunity.family.brand + " " + opportunity.family.description}
          backRoute={ABSOLUTE_ROUTE}
        />

        {!isClosedOpportunity && (
          <div className="flex justify-end items-center gap-2 w-full">
            <Button
              variant="ghost"
              color="red"
              size="sm"
              onClick={() => setShowCloseModal(true)}
            >
              <CircleX className="size-4" />
              Cerrar
            </Button>
            <Link to={`${ABSOLUTE_ROUTE}/actualizar/${opportunity.id}`}>
              <Button variant="secondary" size="sm">
                <Edit className="size-4" />
                Editar
              </Button>
            </Link>
            <Link
              to={`${PURCHASE_REQUEST_QUOTE_ROUTE_ADD.replace(":opportunity_id", opportunity.id.toString())}`}
            >
              <Button variant="default" size="sm">
                <FileText className="size-4" />
                Generar Solicitud
              </Button>
            </Link>
          </div>
        )}
      </HeaderTableWrapper>

      {/* Two-column layout: details left, timeline right */}
      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4 items-start">

        {/* Left panel: Opportunity details */}
        <div className="space-y-3">

          {/* Status + type + main info card */}
          <Card className={cn("overflow-hidden py-0 gap-0", borderColor)}>
            <div className={cn("px-4 py-3 border-b flex items-center justify-between", bgTextColor)}>
              <div className="flex items-center gap-2">
                <Briefcase className={cn("size-4", textColor)} />
                <span className={cn("text-sm font-semibold", textColor)}>
                  {opportunity.opportunity_type}
                </span>
              </div>
              <Badge variant="ghost" className={cn("text-xs font-semibold", statusColor)}>
                {statusLabel}
              </Badge>
            </div>

            <CardContent className="p-4 space-y-4">
              {/* Client */}
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", bgTextColor)}>
                  <User className={cn("size-4", textColor)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-semibold truncate">
                    {opportunity.client.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {opportunity.client.num_doc}
                  </p>
                </div>
              </div>

              {/* Vehicle / Family */}
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", bgTextColor)}>
                  <Car className={cn("size-4", textColor)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Vehículo / Familia</p>
                  <p className="text-sm font-semibold">
                    {opportunity.family.brand} {opportunity.family.description}
                  </p>
                </div>
              </div>

              {/* Worker */}
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg shrink-0", bgTextColor)}>
                  <IdCard className={cn("size-4", textColor)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Asesor</p>
                  <p className="text-sm font-semibold">{opportunity.worker.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {opportunity.worker.document}
                  </p>
                </div>
              </div>

              {/* Client status */}
              <div className="flex items-center justify-between pt-2 border-t border-muted">
                <p className="text-xs text-muted-foreground">Estado del cliente</p>
                <Badge variant="outline" className="text-xs">
                  {opportunity.client_status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact card */}
          <Card className="overflow-hidden py-0 gap-0">
            <div className="px-4 py-2.5 border-b bg-muted/40">
              <p className="text-sm font-semibold text-foreground">Contacto</p>
            </div>
            <CardContent className="p-4 space-y-3">

              {/* Primary phone */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="size-3.5 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="text-sm font-medium truncate">
                      {opportunity.client.phone || "Sin teléfono"}
                    </p>
                  </div>
                </div>
                {opportunity.client.phone && (
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0"
                      asChild
                    >
                      <a
                        href={`tel:+51${opportunity.client.phone.replace(/[\s\-()]/g, "")}`}
                      >
                        <Phone className="size-3" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 text-green-700 border-green-200 hover:bg-green-50"
                      asChild
                    >
                      <a
                        href={`https://wa.me/51${opportunity.client.phone.replace(/[\s\-()]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="size-3" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Secondary phone */}
              {opportunity.client.secondary_phone && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="size-3.5 text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Tel. secundario
                        {opportunity.client.secondary_phone_contact_name && (
                          <span className="ml-1 text-gray-400">
                            ({opportunity.client.secondary_phone_contact_name})
                          </span>
                        )}
                      </p>
                      <p className="text-sm font-medium truncate">
                        {opportunity.client.secondary_phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0"
                      asChild
                    >
                      <a
                        href={`tel:+51${opportunity.client.secondary_phone.replace(/[\s\-()]/g, "")}`}
                      >
                        <Phone className="size-3" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0 text-green-700 border-green-200 hover:bg-green-50"
                      asChild
                    >
                      <a
                        href={`https://wa.me/51${opportunity.client.secondary_phone.replace(/[\s\-()]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="size-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Primary email */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="size-3.5 text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Correo</p>
                    <p className="text-sm font-medium truncate">
                      {opportunity.client.email || "Sin correo"}
                    </p>
                  </div>
                </div>
                {opportunity.client.email && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 shrink-0"
                    asChild
                  >
                    <a href={`mailto:${opportunity.client.email}`}>
                      <Mail className="size-3" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Secondary email */}
              {opportunity.client.secondary_email && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="size-3.5 text-rose-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Correo secundario
                      </p>
                      <p className="text-sm font-medium truncate">
                        {opportunity.client.secondary_email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0 shrink-0"
                    asChild
                  >
                    <a href={`mailto:${opportunity.client.secondary_email}`}>
                      <Mail className="size-3" />
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Closed banner */}
          {isClosedOpportunity && (
            <Card className="border-muted/60 bg-muted/20 py-0 gap-0">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CircleX className="size-4 text-muted-foreground shrink-0" />
                  <p className="text-sm font-semibold">Oportunidad cerrada</p>
                </div>
                {opportunity.comment && (
                  <p className="text-sm text-muted-foreground bg-background border rounded-md p-3">
                    {opportunity.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right panel: Actions Timeline */}
        <Card className="border-none shadow-none py-0 gap-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <NotebookText className="size-5 text-primary" />
                <h3 className="text-base md:text-xl font-semibold text-primary">
                  Acciones de Seguimiento
                </h3>
              </div>
              {!isClosedOpportunity && (
                <Button size="sm" onClick={() => setShowActionForm(true)}>
                  <Plus className="size-4 mr-2" />
                  Acción
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-6 md:pt-0">
            <OpportunityActionTimeline
              actions={actions || []}
              onEdit={handleEditAction}
              onDelete={handleDeleteAction}
              isReadOnly={isClosedOpportunity}
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Form Dialog */}
      <GeneralModal
        open={showActionForm}
        onClose={() => {
          setShowActionForm(false);
          setEditingAction(null);
        }}
        title={editingAction ? "Editar Acción" : "Nueva Acción"}
        subtitle="Registra las acciones de seguimiento realizadas"
        icon="Activity"
        size="2xl"
      >
        <OpportunityActionForm
          defaultValues={{
            opportunity_id: editingAction
              ? editingAction.opportunity_id.toString()
              : opportunityId.toString(),
            action_type_id: editingAction
              ? editingAction.action_type_id.toString()
              : "",
            action_contact_type_id: editingAction
              ? editingAction.action_contact_type_id.toString()
              : "",
            description: editingAction ? editingAction.description : "",
            result: editingAction ? editingAction.result : false,
          }}
          onSubmit={editingAction ? handleUpdateAction : handleCreateAction}
          isSubmitting={
            editingAction
              ? updateActionMutation.isPending
              : createActionMutation.isPending
          }
          mode={editingAction ? "update" : "create"}
          opportunityId={opportunityId}
          onCancel={() => {
            setShowActionForm(false);
            setEditingAction(null);
          }}
        />
      </GeneralModal>

      {/* Close Opportunity Modal */}
      <GeneralModal
        open={showCloseModal}
        onClose={() => {
          setShowCloseModal(false);
          setCloseComment("");
        }}
        title="Cerrar Oportunidad"
        maxWidth="!max-w-(--breakpoint-sm)"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Por favor, ingresa un comentario sobre el cierre de esta oportunidad.
            Este campo es obligatorio.
          </p>
          <Textarea
            placeholder="Escribe aquí el motivo o comentario del cierre..."
            value={closeComment}
            onChange={(e) => setCloseComment(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCloseModal(false);
                setCloseComment("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCloseOpportunity}
              disabled={
                closeOpportunityMutation.isPending || !closeComment.trim()
              }
            >
              {closeOpportunityMutation.isPending ? (
                "Cerrando..."
              ) : (
                <>
                  <CircleX className="size-4 mr-2" />
                  Cerrar Oportunidad
                </>
              )}
            </Button>
          </div>
        </div>
      </GeneralModal>
    </FormWrapper>
  );
}
