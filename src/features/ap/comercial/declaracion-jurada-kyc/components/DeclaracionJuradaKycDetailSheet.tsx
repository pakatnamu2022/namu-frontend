"use client";

import GeneralSheet from "@/shared/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { useCustomerKycDeclarationById } from "../lib/declaracionJuradaKyc.hook";
import {
  KYC_STATUS_LABEL,
  LEGAL_REVIEW_STATUS_LABEL,
  LEGAL_REVIEW_STATUS_COLOR,
  BENEFICIARY_TYPE_OPTIONS,
  PEP_STATUS_OPTIONS,
} from "../lib/declaracionJuradaKyc.constants";
import {
  User,
  Shield,
  Users,
  Banknote,
  FileText,
  Scale,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/core/core.function";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: number;
}

const statusColorMap: Record<string, "yellow" | "blue" | "green" | "gray"> = {
  PENDIENTE: "yellow",
  GENERADO: "blue",
  FIRMADO: "green",
};

const pepLabel = (val: string) =>
  PEP_STATUS_OPTIONS.find((o) => o.value === val)?.label ?? val;

const beneficiaryLabel = (val: string) =>
  BENEFICIARY_TYPE_OPTIONS.find((o) => o.value === val)?.label ?? val;

export default function DeclaracionJuradaKycDetailSheet({
  open,
  onOpenChange,
  id,
}: Props) {
  const { data: decl, isLoading } = useCustomerKycDeclarationById(id);

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalle — Declaración Jurada KYC"
      subtitle={decl ? `${decl.full_name} · ${decl.num_doc}` : undefined}
      icon="FileCheck"
      side="right"
      size="4xl"
      isLoading={isLoading}
    >
      {decl && (
        <div className="space-y-4">
          {/* Información General */}
          <GroupFormSection
            title="Información General"
            icon={FileText}
            cols={{ sm: 2, md: 3, xl: 4 }}
            headerExtra={
              <Badge
                variant="outline"
                color={statusColorMap[decl.status] ?? "gray"}
              >
                {KYC_STATUS_LABEL[decl.status] ?? decl.status}
              </Badge>
            }
          >
            <div>
              <p className="text-xs text-muted-foreground">Fecha Declaración</p>
              <p className="font-semibold">
                {decl.declaration_date
                  ? formatDate(decl.declaration_date)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Cotización vinculada
              </p>
              <p className="font-medium">
                {decl.purchase_request_quote_id ?? "Sin cotización"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ocupación</p>
              <p className="font-medium">{decl.occupation || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Teléfono Fijo</p>
              <p className="font-medium">{decl.fixed_phone || "—"}</p>
            </div>
            <div className="col-span-full">
              <p className="text-xs text-muted-foreground">
                Propósito Relación
              </p>
              <p className="font-medium">{decl.purpose_relationship || "—"}</p>
            </div>
            {decl.signed_file_path && (
              <div className="col-span-full flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">PDF Firmado</p>
                  <p className="font-medium text-sm">Documento cargado</p>
                </div>
                <a
                  href={decl.signed_file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                >
                  <ExternalLink className="size-3" />
                  Ver documento
                </a>
              </div>
            )}
          </GroupFormSection>

          {/* Revisión Legal */}
          <GroupFormSection
            title="Revisión Legal"
            icon={Scale}
            cols={{ sm: 2, md: 2, xl: 4 }}
            headerExtra={
              decl.legal_review_status ? (
                <Badge
                  variant="outline"
                  color={
                    LEGAL_REVIEW_STATUS_COLOR[decl.legal_review_status] ??
                    "gray"
                  }
                >
                  {LEGAL_REVIEW_STATUS_LABEL[decl.legal_review_status] ??
                    decl.legal_review_status}
                </Badge>
              ) : (
                <Badge variant="outline">Sin revisión</Badge>
              )
            }
          >
            <div>
              <p className="text-xs text-muted-foreground">Revisado por</p>
              <p className="font-medium">{decl.reviewed_by || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha de revisión</p>
              <p className="font-medium">
                {decl.legal_review_at ? formatDate(decl.legal_review_at) : "—"}
              </p>
            </div>
            {decl.legal_review_comments && (
              <div className="col-span-full">
                <p className="text-xs text-muted-foreground">
                  Motivo de rechazo
                </p>
                <p className="mt-1 rounded border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
                  {decl.legal_review_comments}
                </p>
              </div>
            )}
            {!decl.legal_review_status && (
              <div className="col-span-full">
                <p className="text-sm text-muted-foreground">
                  Pendiente de revisión por el área legal.
                </p>
              </div>
            )}
          </GroupFormSection>

          {/* Datos del Cliente */}
          <GroupFormSection
            title="Datos del Cliente"
            icon={User}
            cols={{ sm: 2, md: 3, xl: 4 }}
          >
            <div className="col-span-full md:col-span-2">
              <p className="text-xs text-muted-foreground">Nombre Completo</p>
              <p className="font-semibold">{decl.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo Documento</p>
              <p className="font-medium">{decl.document_type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">N° Documento</p>
              <p className="font-medium">{decl.num_doc}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nacionalidad</p>
              <p className="font-medium">{decl.nationality || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado Civil</p>
              <p className="font-medium">{decl.marital_status || "—"}</p>
            </div>
            {decl.spouse_full_name && (
              <div>
                <p className="text-xs text-muted-foreground">Cónyuge</p>
                <p className="font-medium">{decl.spouse_full_name}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Teléfono</p>
              <p className="font-medium">{decl.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium text-sm break-all">
                {decl.email || "—"}
              </p>
            </div>
            <div className="col-span-full">
              <p className="text-xs text-muted-foreground">Dirección</p>
              <p className="font-medium text-sm">
                {[decl.direction, decl.district, decl.province, decl.department]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
          </GroupFormSection>

          {/* Situación PEP */}
          <GroupFormSection
            title="Situación PEP"
            icon={Shield}
            cols={{ sm: 2, md: 2, xl: 4 }}
          >
            <div>
              <p className="text-xs text-muted-foreground">Estado PEP</p>
              <p className="font-medium">{pepLabel(decl.pep_status)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Estado PEP Colaborador
              </p>
              <p className="font-medium">
                {pepLabel(decl.pep_collaborator_status)}
              </p>
            </div>
            {decl.pep_position && (
              <div>
                <p className="text-xs text-muted-foreground">Cargo PEP</p>
                <p className="font-medium">{decl.pep_position}</p>
              </div>
            )}
            {decl.pep_institution && (
              <div>
                <p className="text-xs text-muted-foreground">Institución PEP</p>
                <p className="font-medium">{decl.pep_institution}</p>
              </div>
            )}
            {decl.pep_spouse_name && (
              <div>
                <p className="text-xs text-muted-foreground">Cónyuge PEP</p>
                <p className="font-medium">{decl.pep_spouse_name}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">¿Pariente de PEP?</p>
              <p className="font-medium">
                {decl.is_pep_relative === "SI_SOY" ? "Sí" : "No"}
              </p>
            </div>
          </GroupFormSection>

          {/* Parientes con cargo público */}
          {decl.pep_relatives && decl.pep_relatives.length > 0 && (
            <GroupFormSection
              title="Parientes con Cargo Público"
              icon={Users}
              cols={{ sm: 1 }}
            >
              <ul className="space-y-1">
                {decl.pep_relatives.map((name, i) => (
                  <li key={i} className="text-sm font-medium">
                    {i + 1}. {name}
                  </li>
                ))}
              </ul>
            </GroupFormSection>
          )}

          {/* Parientes PEP del Declarante */}
          {decl.pep_relative_data && decl.pep_relative_data.length > 0 && (
            <GroupFormSection
              title="Parientes PEP del Declarante"
              icon={Users}
              cols={{ sm: 1, md: 2 }}
            >
              {decl.pep_relative_data.map((rel, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg bg-muted/30 space-y-1"
                >
                  <p className="font-semibold text-sm">{rel.pep_full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {rel.relationship}
                  </p>
                </div>
              ))}
            </GroupFormSection>
          )}

          {/* Beneficiario de la Operación */}
          <GroupFormSection
            title="Beneficiario de la Operación"
            icon={Banknote}
            cols={{ sm: 1, md: 2, xl: 3 }}
          >
            <div>
              <p className="text-xs text-muted-foreground">Tipo Beneficiario</p>
              <p className="font-semibold">
                {beneficiaryLabel(decl.beneficiary_type)}
              </p>
            </div>

            {decl.beneficiary_type === "PROPIO" && (
              <div className="md:col-span-2 xl:col-span-2">
                <p className="text-xs text-muted-foreground">
                  Origen de Fondos Propios
                </p>
                <p className="font-medium">{decl.own_funds_origin || "—"}</p>
              </div>
            )}

            {decl.beneficiary_type === "TERCERO_NATURAL" && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Nombre del Tercero
                  </p>
                  <p className="font-medium">{decl.third_full_name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Documento</p>
                  <p className="font-medium">
                    {decl.third_doc_type} {decl.third_doc_number || "—"}
                  </p>
                </div>
                {decl.third_representation_type && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Representación
                    </p>
                    <p className="font-medium">
                      {decl.third_representation_type}
                    </p>
                  </div>
                )}
                {decl.third_pep_status && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      PEP del Tercero
                    </p>
                    <p className="font-medium">{decl.third_pep_status}</p>
                  </div>
                )}
                {decl.third_pep_position && (
                  <div>
                    <p className="text-xs text-muted-foreground">Cargo PEP</p>
                    <p className="font-medium">{decl.third_pep_position}</p>
                  </div>
                )}
                {decl.third_pep_institution && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Institución PEP
                    </p>
                    <p className="font-medium">{decl.third_pep_institution}</p>
                  </div>
                )}
                <div className="col-span-full">
                  <p className="text-xs text-muted-foreground">
                    Origen de Fondos
                  </p>
                  <p className="font-medium">
                    {decl.third_funds_origin || "—"}
                  </p>
                </div>
              </>
            )}

            {(decl.beneficiary_type === "PERSONA_JURIDICA" ||
              decl.beneficiary_type === "ENTE_JURIDICO") && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Nombre / Razón Social
                  </p>
                  <p className="font-medium">{decl.entity_name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">RUC</p>
                  <p className="font-medium">{decl.entity_ruc || "—"}</p>
                </div>
                {decl.entity_representation_type && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Tipo Representación
                    </p>
                    <p className="font-medium">
                      {decl.entity_representation_type}
                    </p>
                  </div>
                )}
                {decl.entity_final_beneficiary && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Beneficiario Final
                    </p>
                    <p className="font-medium">
                      {decl.entity_final_beneficiary}
                    </p>
                  </div>
                )}
                <div className="col-span-full">
                  <p className="text-xs text-muted-foreground">
                    Origen de Fondos
                  </p>
                  <p className="font-medium">
                    {decl.entity_funds_origin || "—"}
                  </p>
                </div>
              </>
            )}
          </GroupFormSection>
        </div>
      )}
    </GeneralSheet>
  );
}
