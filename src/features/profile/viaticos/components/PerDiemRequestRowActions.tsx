"use client";

import { Button } from "@/components/ui/button";
import {
  Eye,
  Hotel,
  CheckCircle,
  Upload,
  FileCheck2,
  Download,
  Loader2,
  RotateCcwSquare,
  RotateCcw,
  MailPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  confirmProgressPerDiemRequest,
  completeSettlement,
  expenseTotalWithEvidencePdf,
  resendPerDiemRequestEmails,
  resetApprovals,
} from "../lib/perDiemRequest.actions";
import {
  ABSOLUTE_ROUTE_GP,
  PER_DIEM_REQUEST,
  PER_DIEM_REQUEST_AP,
} from "../lib/perDiemRequest.constants";
import { useState } from "react";
import { errorToast, successToast } from "@/core/core.function";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";

interface PerDiemRequestRowActionsProps {
  request: PerDiemRequestResource;
  onViewDetail: (id: number) => void;
  onViewHotelReservation?: (requestId: number) => void;
  module: "gh" | "contabilidad";
  permissions?: {
    canSend?: boolean;
  };
}

export function PerDiemRequestRowActions({
  request,
  onViewDetail,
  onViewHotelReservation,
  module = "gh",
  permissions,
}: PerDiemRequestRowActionsProps) {
  const { ROUTE } = PER_DIEM_REQUEST;
  const { ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_AP } = PER_DIEM_REQUEST_AP;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCompleteSettlementDialogOpen, setIsCompleteSettlementDialogOpen] =
    useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isResendEmailPopoverOpen, setIsResendEmailPopoverOpen] =
    useState(false);
  const [emailType, setEmailType] = useState<string>("in_progress");
  const [sendToEmployee, setSendToEmployee] = useState(true);
  const [sendToB, setSendToBoss] = useState(false);
  const [sendToAccounting, setSendToAccounting] = useState(false);
  const [isResetApprovalsDialogOpen, setIsResetApprovalsDialogOpen] =
    useState(false);

  const hasHotelReservation = !!request.hotel_reservation;
  const isApproved =
    request.status === "approved" || request.status === "in_progress";
  const isPendingSettlement = request.status === "pending_settlement";
  const hotel = request.hotel_reservation?.hotel_name;
  const isCancelled = request.status === "cancelled";
  const canCompleteSettlement = request.settlement_status === "approved";
  const isOnlyApproved = request.status === "approved";
  const { canAuthorize, canAnnul } = useModulePermissions(ROUTE);
  const statusForAnnul =
    request.status === "pending" || request.status === "approved";

  const confirmMutation = useMutation({
    mutationFn: (requestId: number) => confirmProgressPerDiemRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY],
      });
      successToast("Solicitud en progreso");
      setIsConfirmDialogOpen(false);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al confirmar la solicitud ",
      );
    },
  });

  const [settlementComments, setSettlementComments] = useState("");

  const completeSettlementMutation = useMutation({
    mutationFn: ({
      requestId,
      comments,
    }: {
      requestId: number;
      comments?: string;
    }) => completeSettlement(requestId, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY],
      });
      successToast("Liquidación completada exitosamente");
      setIsCompleteSettlementDialogOpen(false);
      setSettlementComments("");
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al completar la liquidación",
      );
    },
  });

  const resendEmailMutation = useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: number;
      data: {
        email_type: string;
        send_to_employee: boolean;
        send_to_boss: boolean;
        send_to_accounting: boolean;
      };
    }) => resendPerDiemRequestEmails(requestId, data),
    onSuccess: () => {
      successToast("Emails reenviados exitosamente");
      setIsResendEmailPopoverOpen(false);
      // Reset form
      setEmailType("in_progress");
      setSendToEmployee(true);
      setSendToBoss(false);
      setSendToAccounting(false);
    },
    onError: (error: any) => {
      errorToast(error?.response?.data?.message || "Error al reenviar emails");
    },
  });

  const resetApprovalsMutation = useMutation({
    mutationFn: (requestId: number) => resetApprovals(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY],
      });
      successToast("Aprobaciones restablecidas exitosamente");
      setIsResetApprovalsDialogOpen(false);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al restablecer aprobaciones",
      );
    },
  });

  const handleConfirmRequest = () => {
    confirmMutation.mutate(request.id);
  };

  const handleCompleteSettlement = () => {
    completeSettlementMutation.mutate({
      requestId: request.id,
      comments: settlementComments || undefined,
    });
  };

  const handleResendEmails = () => {
    if (!sendToEmployee && !sendToB && !sendToAccounting) {
      errorToast("Debe seleccionar al menos un destinatario");
      return;
    }

    resendEmailMutation.mutate({
      requestId: request.id,
      data: {
        email_type: emailType,
        send_to_employee: sendToEmployee,
        send_to_boss: sendToB,
        send_to_accounting: sendToAccounting,
      },
    });
  };

  const prefix = module === "gh" ? ABSOLUTE_ROUTE_GP : ABSOLUTE_ROUTE_AP;

  const handleAddHotelReservation = () => {
    navigate(`${prefix}/${request.id}/reserva-hotel/agregar`);
  };

  const handleSeeReservation = () => {
    if (onViewHotelReservation) {
      onViewHotelReservation(request.id);
    } else {
      navigate(`${prefix}/${request.id}/reserva-hotel/detalle`);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await expenseTotalWithEvidencePdf(request.id);
      successToast("PDF descargado correctamente");
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isCancelled)
    return (
      <div className="flex items-center gap-2 justify-center">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onViewDetail(request.id)}
          tooltip="Ver detalle"
        >
          <Eye className="size-4" />
        </Button>
      </div>
    );

  return (
    <>
      <div className="flex items-center gap-2 justify-center">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onViewDetail(request.id)}
          tooltip="Ver detalle"
        >
          <Eye className="size-4" />
        </Button>

        {request.settled &&
          request.status === "settled" &&
          module === "contabilidad" && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={handleDownloadPdf}
              tooltip={isDownloading ? "Generando PDF..." : "Descargar PDF"}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Download className="size-5" />
              )}
            </Button>
          )}

        {request.days_count > 1 && module === "gh" && (
          <Button
            variant={hasHotelReservation ? "default" : "outline"}
            size="icon-xs"
            onClick={
              isApproved
                ? hasHotelReservation
                  ? handleSeeReservation
                  : handleAddHotelReservation
                : undefined
            }
            tooltip={
              hasHotelReservation
                ? `Hotel: ${hotel}`
                : "Agregar reserva de hotel"
            }
            disabled={!isApproved}
          >
            <Hotel className="size-4" />
          </Button>
        )}

        {isPendingSettlement && module === "contabilidad" && (
          <ConfirmationDialog
            trigger={
              <Button
                variant="default"
                size="icon-xs"
                tooltip="Poner en progreso"
                disabled={confirmMutation.isPending}
              >
                <RotateCcwSquare className="size-4" />
              </Button>
            }
            title="¿Poner solicitud en progreso?"
            description="Esta acción cambiará el estado de la solicitud de 'Liquidación Pendiente' a 'En Progreso'. ¿Deseas continuar?"
            confirmText="Sí, continuar"
            cancelText="Cancelar"
            onConfirm={handleConfirmRequest}
            variant="default"
            icon="info"
            open={isConfirmDialogOpen}
            onOpenChange={setIsConfirmDialogOpen}
          />
        )}

        {isOnlyApproved && canAuthorize && (
          <ConfirmationDialog
            trigger={
              <Button
                variant="default"
                size="icon-xs"
                tooltip="Confirmar solicitud"
                disabled={confirmMutation.isPending}
              >
                <CheckCircle className="size-4" />
              </Button>
            }
            title="¿Confirmar solicitud de viáticos?"
            description="Esta acción cambiará el estado de la solicitud a 'En Progreso' y podrás comenzar a registrar gastos. ¿Deseas continuar?"
            confirmText="Sí, confirmar"
            cancelText="Cancelar"
            onConfirm={handleConfirmRequest}
            variant="default"
            icon="info"
            open={isConfirmDialogOpen}
            onOpenChange={setIsConfirmDialogOpen}
          />
        )}

        {module === "contabilidad" &&
          ["approved", "in_progress", "pending_settlement"].includes(
            request.status,
          ) && (
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => navigate(`${prefix}/${request.id}/deposito`)}
              tooltip="Subir archivo de depósito"
            >
              <Upload className="size-4" />
            </Button>
          )}

        {canCompleteSettlement && module === "contabilidad" && (
          <ConfirmationDialog
            trigger={
              <Button
                variant="outline"
                color="blue"
                size="icon-xs"
                tooltip="Completar liquidación"
                disabled={completeSettlementMutation.isPending}
              >
                <FileCheck2 className="size-4" />
              </Button>
            }
            title="¿Completar liquidación?"
            description="Esta acción completará el proceso de liquidación. El jefe ya aprobó la liquidación. ¿Deseas continuar?"
            confirmText="Sí, completar"
            cancelText="Cancelar"
            onConfirm={handleCompleteSettlement}
            variant="default"
            icon="info"
            open={isCompleteSettlementDialogOpen}
            onOpenChange={setIsCompleteSettlementDialogOpen}
            confirmDisabled={completeSettlementMutation.isPending}
          >
            <div className="space-y-2">
              <Label htmlFor="settlement-comments">
                Comentarios (Opcional)
              </Label>
              <Textarea
                id="settlement-comments"
                placeholder="Ingrese sus comentarios aquí..."
                value={settlementComments}
                onChange={(e) => setSettlementComments(e.target.value)}
                rows={4}
                disabled={completeSettlementMutation.isPending}
              />
            </div>
          </ConfirmationDialog>
        )}

        {module === "gh" && canAnnul && statusForAnnul && (
          <ConfirmationDialog
            trigger={
              <Button
                variant="outline"
                size="icon-xs"
                tooltip="Restablecer aprobaciones"
                disabled={resetApprovalsMutation.isPending}
              >
                <RotateCcw className="size-4" />
              </Button>
            }
            title="¿Restablecer aprobaciones?"
            description="Esta acción restablecerá las aprobaciones de la solicitud. ¿Deseas continuar?"
            confirmText="Sí, restablecer"
            cancelText="Cancelar"
            onConfirm={() => resetApprovalsMutation.mutate(request.id)}
            variant="destructive"
            icon="warning"
            open={isResetApprovalsDialogOpen}
            onOpenChange={setIsResetApprovalsDialogOpen}
          />
        )}

        {permissions?.canSend && module === "gh" && (
          <Popover
            open={isResendEmailPopoverOpen}
            onOpenChange={setIsResendEmailPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon-xs"
                tooltip="Reenviar emails"
                disabled={resendEmailMutation.isPending}
              >
                <MailPlus className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 h-auto max-h-max" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Reenviar Emails</h4>
                  <p className="text-xs text-muted-foreground">
                    Seleccione el tipo de email y los destinatarios
                  </p>
                </div>

                <div className="space-y-3">
                  <SearchableSelect
                    onChange={setEmailType}
                    value={emailType}
                    options={[
                      { value: "created", label: "Solicitud creada" },
                      { value: "approved", label: "Solicitud aprobada" },
                      { value: "in_progress", label: "Solicitud en progreso" },
                      { value: "settlement", label: "Inicio de Liquidación" },
                      { value: "settled", label: "Liquidada" },
                      { value: "cancelled", label: "Solicitud cancelada" },
                    ]}
                  />

                  <div className="space-y-3 px-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-to-employee"
                        checked={sendToEmployee}
                        onCheckedChange={(checked) =>
                          setSendToEmployee(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="send-to-employee"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Enviar al colaborador
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-to-boss"
                        checked={sendToB}
                        onCheckedChange={(checked) =>
                          setSendToBoss(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="send-to-boss"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Enviar al jefe
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-to-accounting"
                        checked={sendToAccounting}
                        onCheckedChange={(checked) =>
                          setSendToAccounting(checked as boolean)
                        }
                      />
                      <label
                        htmlFor="send-to-accounting"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Enviar a contabilidad
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsResendEmailPopoverOpen(false)}
                      disabled={resendEmailMutation.isPending}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleResendEmails}
                      disabled={resendEmailMutation.isPending}
                    >
                      {resendEmailMutation.isPending ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </>
  );
}
