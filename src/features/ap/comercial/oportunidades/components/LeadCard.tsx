"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  X,
  UserPlus,
  User,
  Car,
  Phone,
  BriefcaseBusiness,
  Calendar,
  PhoneCall,
} from "lucide-react";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { ManageLeadsResource } from "../../gestionar-leads/lib/manageLeads.interface";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useAllReasonsRejection } from "../../motivos-descarte/lib/reasonsRejection.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { OPPORTUNITIES } from "../lib/opportunities.constants";
import { cleanText } from "@/core/core.function";

interface LeadCardProps {
  lead: ManageLeadsResource;
  onDiscard: (
    leadId: number,
    comment: string,
    reasonDiscardingId: number,
  ) => void;
}

export const LeadCard = ({ lead, onDiscard }: LeadCardProps) => {
  const router = useNavigate();
  const [comment, setComment] = useState("");
  const [reasonDiscardingId, setReasonDiscardingId] = useState<number | null>(
    null,
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
        `${OPPORTUNITIES_ROUTE}/agregar?client_id=${lead.client_id}&lead_id=${lead.id}`,
      );
    }
  };

  const { data: reasonDiscarding = [], isLoading: isLoadingreasonDiscarding } =
    useAllReasonsRejection();

  const confirmDiscard = () => {
    if (reasonDiscardingId) {
      onDiscard(lead.id, comment, reasonDiscardingId);
      setComment("");
      setReasonDiscardingId(null);
    }
  };

  if (isLoadingreasonDiscarding) return <FormSkeleton />;

  return (
    <>
      <Card className="p-3 hover:shadow-sm transition-all border-primary/15 hover:bg-blue-300/5 bg-linear-to-br from-muted to-background">
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

          {/* Date with Type Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <p className="font-medium text-sm truncate">{lead.created_at}</p>
            </div>
            {lead.type && (
              <Badge variant="outline" className="text-xs">
                {lead.type}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1.5 pt-1">
            <ConfirmationDialog
              trigger={
                <Button variant="ghost" size="sm">
                  <X />
                  Descartar
                </Button>
              }
              title="¿Descartar Lead?"
              description={`¿Estás seguro de descartar a ${lead.full_name}? Esta acción cambiará el estado del lead.`}
              confirmText="Sí, Descartar"
              cancelText="Cancelar"
              onConfirm={confirmDiscard}
              variant="destructive"
              icon="danger"
              confirmDisabled={!comment || !reasonDiscardingId}
            >
              <div className="grid gap-4 grid-cols-1">
                <SearchableSelect
                  className="w-full!"
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
            </ConfirmationDialog>

            <Button size="sm" onClick={handleCreateClient}>
              {!lead.client_id ? <UserPlus /> : <BriefcaseBusiness />}
              Cliente
            </Button>

            {lead.phone && (
              <>
                <Button size="icon-sm" color="blue" asChild>
                  <a href={`tel:${lead.phone}`} title="Llamar">
                    <PhoneCall className="size-3.5" />
                  </a>
                </Button>

                <Button size="icon-sm" color="green" asChild>
                  <a
                    href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3.5"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </>
  );
};
