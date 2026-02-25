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
  TextIcon,
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
import { GroupFormSection } from "@/shared/components/GroupFormSection";

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
      errorToast(
        "Esta oportunidad está cerrada. No se pueden eliminar acciones.",
      );
      return;
    }
    deleteActionMutation.mutate(actionId);
  };

  const handleEditAction = (action: OpportunityActionResource) => {
    if (isClosedOpportunity) {
      errorToast(
        "Esta oportunidad está cerrada. No se pueden actualizar acciones.",
      );
      return;
    }
    setEditingAction(action);
    setShowActionForm(true);
  };

  const closeOpportunityMutation = useCloseOpportunity();

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

  const statusColor =
    OPPORTUNITY_STATUS_COLORS[opportunity.opportunity_status] ||
    "bg-muted-foretext-muted-foreground text-white";

  return (
    <FormWrapper>
      <HeaderTableWrapper>
        <TitleFormComponent
          title={opportunity.client.full_name}
          mode="edit"
          subtitle={
            opportunity.family.brand + " " + opportunity.family.description
          }
          backRoute={ABSOLUTE_ROUTE}
        />

        {!isClosedOpportunity && (
          <div className="flex justify-end items-center gap-2 w-full">
            <Button
              variant="secondary"
              color="red"
              size="sm"
              onClick={() => setShowCloseModal(true)}
            >
              <CircleX className="size-4" />
              Cerrar Oportunidad
            </Button>

            <Link
              to={`${PURCHASE_REQUEST_QUOTE_ROUTE_ADD.replace(":opportunity_id", opportunity.id.toString())}`}
            >
              <Button variant="default" size="sm">
                <FileText className="size-4" />
                Generar Solicitud
              </Button>
            </Link>

            <Link to={`${ABSOLUTE_ROUTE}/actualizar/${opportunity.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="size-4" />
                Editar
              </Button>
            </Link>
          </div>
        )}
      </HeaderTableWrapper>

      <GroupFormSection
        title="Detalles de la Oportunidad"
        cols={{ sm: 1 }}
        icon={TextIcon}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base md:text-2xl font-bold text-primary"></h2>
            <p className="text-xs md:text-base text-muted-foreground">
              {opportunity.opportunity_type}
            </p>
          </div>
          <Badge variant="ghost" className={cn(statusColor)}>
            {opportunity.opportunity_status}
          </Badge>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Cliente
              </p>
              <p className="text-sm md:text-base font-semibold">
                {opportunity.client.full_name}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                {opportunity.client.num_doc}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Asesor</p>
              <p className="text-sm md:text-base font-semibold">
                {opportunity.worker.name}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                {opportunity.worker.document}
              </p>
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Estado del Cliente
              </p>
              <Badge variant="outline">{opportunity.client_status}</Badge>
            </div>
          </div>

          {/* Información de contacto del cliente */}
          <div className="space-y-4 p-4 rounded-lg bg-linear-to-br from-gray-50 to-white">
            <p className="text-sm font-bold text-gray-900">
              Información de Contacto
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Teléfono principal */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Phone className="size-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">
                      Teléfono
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {opportunity.client.phone || "Sin teléfono"}
                    </p>
                  </div>
                </div>
                {opportunity.client.phone && (
                  <div className="flex gap-2 ml-11">
                    <Button
                      size="sm"
                      className="h-9 gap-2 text-xs font-medium text-white"
                      asChild
                    >
                      <a
                        href={`tel:+51${opportunity.client.phone.replace(/[\s\-()]/g, "")}`}
                      >
                        <Phone className="size-3.5" />
                        Llamar
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 gap-2 text-xs font-medium bg-green-700 hover:bg-green-800 text-white"
                      asChild
                    >
                      <a
                        href={`https://wa.me/51${opportunity.client.phone.replace(/[\s\-()]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="size-3.5" />
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Mail className="size-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-medium">
                      Correo electrónico
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {opportunity.client.email || "Sin correo"}
                    </p>
                  </div>
                </div>
                {opportunity.client.email && (
                  <div className="ml-11">
                    <Button
                      size="sm"
                      className="h-9 gap-2 text-xs font-medium bg-secondary hover:bg-secondary/90 text-white"
                      asChild
                    >
                      <a href={`mailto:${opportunity.client.email}`}>
                        <Mail className="size-3.5" />
                        Enviar correo
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Teléfono secundario */}
              {opportunity.client.secondary_phone && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Phone className="size-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">
                        Teléfono secundario
                        {opportunity.client.secondary_phone_contact_name && (
                          <span className="ml-1 text-gray-400">
                            ({opportunity.client.secondary_phone_contact_name})
                          </span>
                        )}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {opportunity.client.secondary_phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-11">
                    <Button
                      size="sm"
                      className="h-9 gap-2 text-xs font-medium text-white"
                      asChild
                    >
                      <a
                        href={`tel:+51${opportunity.client.secondary_phone.replace(/[\s\-()]/g, "")}`}
                      >
                        <Phone className="size-3.5" />
                        Llamar
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 gap-2 text-xs font-medium bg-green-700 hover:bg-green-800 text-white"
                      asChild
                    >
                      <a
                        href={`https://wa.me/51${opportunity.client.secondary_phone.replace(/[\s\-()]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageSquare className="size-3.5" />
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Email secundario */}
              {opportunity.client.secondary_email && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Mail className="size-4 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium">
                        Correo secundario
                      </p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {opportunity.client.secondary_email}
                      </p>
                    </div>
                  </div>
                  <div className="ml-11">
                    <Button
                      size="sm"
                      className="h-9 gap-2 text-xs font-medium bg-secondary hover:bg-secondary/90 text-white"
                      asChild
                    >
                      <a href={`mailto:${opportunity.client.secondary_email}`}>
                        <Mail className="size-3.5" />
                        Enviar correo
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isClosedOpportunity && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-4">
                <CircleX className="size-6 text-gray-600" />
                <p className="text-gray-800 font-semibold">
                  Esta oportunidad está cerrada. No se pueden modificar
                  acciones.
                </p>
              </div>
              {opportunity.comment && (
                <div className="pl-10">
                  <p className="text-sm text-muted-foreground mb-1">
                    Comentario de cierre:
                  </p>
                  <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-md p-3">
                    {opportunity.comment}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </GroupFormSection>

      {/* Actions Timeline */}
      <Card className="border-none shadow-none gap-3">
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

      {/* Action Form Dialog */}
      <GeneralModal
        open={showActionForm}
        onClose={() => {
          setShowActionForm(false);
          setEditingAction(null);
        }}
        title={editingAction ? "Editar Acción" : "Nueva Acción"}
        maxWidth="!max-w-(--breakpoint-md)"
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
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Por favor, ingresa un comentario sobre el cierre de esta
              oportunidad. Este campo es obligatorio.
            </p>
            <Textarea
              placeholder="Escribe aquí el motivo o comentario del cierre..."
              value={closeComment}
              onChange={(e) => setCloseComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
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
