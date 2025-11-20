"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  UserPlus,
  User,
  Car,
  Phone,
  BriefcaseBusiness,
  Calendar,
} from "lucide-react";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { ManageLeadsResource } from "../../gestionar-leads/lib/manageLeads.interface";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
import { useAllReasonsRejection } from "../../motivos-descarte/lib/reasonsRejection.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { OPPORTUNITIES } from "../lib/opportunities.constants";
import { cleanText } from "@/core/core.function";

interface LeadCardProps {
  lead: ManageLeadsResource;
  onDiscard: (
    leadId: number,
    comment: string,
    reasonDiscardingId: number
  ) => void;
}

export const LeadCard = ({ lead, onDiscard }: LeadCardProps) => {
  const router = useNavigate();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [comment, setComment] = useState("");
  const [reasonDiscardingId, setReasonDiscardingId] = useState<number | null>(
    null
  );
  const { ABSOLUTE_ROUTE: OPPORTUNITIES_ROUTE } = OPPORTUNITIES;

  const handleCreateClient = () => {
    if (!lead.client_id) {
      // Redirect to create client page with lead data as query params
      const queryParams = new URLSearchParams({
        from_lead: "true",
        redirect_to: "opportunities",
        lead_id: lead.id.toString(),
        num_doc: lead.num_doc || "",
        full_name: lead.full_name || "",
        phone: lead.phone || "",
        email: lead.email || "",
        document_type_id: lead.document_type_id?.toString() || "",
      });

      router(`/ap/comercial/clientes/agregar?${queryParams.toString()}`);
    } else {
      router(
        `${OPPORTUNITIES_ROUTE}/agregar?client_id=${lead.client_id}&lead_id=${lead.id}`
      );
    }
  };

  const { data: reasonDiscarding = [], isLoading: isLoadingreasonDiscarding } =
    useAllReasonsRejection();

  const handleDiscard = () => {
    setShowDiscardDialog(true);
  };

  const confirmDiscard = () => {
    if (reasonDiscardingId) {
      onDiscard(lead.id, comment, reasonDiscardingId);
      setShowDiscardDialog(false);
      setComment("");
      setReasonDiscardingId(null);
    }
  };

  if (isLoadingreasonDiscarding) return <FormSkeleton />;

  return (
    <>
      <Card className="p-3 hover:shadow-sm transition-all border-primary/15 hover:bg-blue-300/5">
        <div className="w-full flex flex-col gap-1.5">
          {/* Client Name */}
          <div className="flex items-center gap-2">
            <User className="size-4 text-primary" />
            <p className="font-semibold text-sm truncate">{lead.full_name}</p>
          </div>

          {/* Vehicle */}
          <div className="flex items-center gap-2">
            <Car className="size-4 text-primary" />
            <p className="font-medium text-sm truncate">{lead.model}</p>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-2">
            <Phone className="size-4 text-muted-foreground" />
            <p className="font-medium text-sm truncate">{lead.phone}</p>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <p className="font-medium text-sm truncate">{lead.created_at}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs h-7 text-muted-foreground hover:text-red-600 hover:bg-red-50"
              onClick={handleDiscard}
            >
              <X className="size-3 mr-1" />
              Descartar
            </Button>

            <Button
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={handleCreateClient}
            >
              {!lead.client_id ? (
                <UserPlus className="size-3 mr-1" />
              ) : (
                <BriefcaseBusiness className="size-3 mr-1" />
              )}
              Cliente
            </Button>
          </div>
        </div>
      </Card>

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar Lead?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de descartar a{" "}
              <span className="font-semibold">{lead.full_name}</span>? Esta
              acción cambiará el estado del lead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 grid gap-4 grid-cols-1">
            <SearchableSelect
              className="!w-full"
              label="Motivo de Descarte"
              value={reasonDiscardingId?.toString() || ""}
              onChange={(value) => setReasonDiscardingId(Number(value))}
              options={reasonDiscarding.map((item) => ({
                label: item.description,
                value: item.id.toString(),
              }))}
              placeholder="Selecciona un motivo"
            />
            <Textarea
              placeholder="Agrega un comentario"
              value={comment}
              onChange={(e) => setComment(cleanText(e.target.value))}
              className="min-h-[100px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={!comment || !reasonDiscardingId}
              onClick={confirmDiscard}
            >
              Sí, Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
