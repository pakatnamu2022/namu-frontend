"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useUserComplete } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import { ChangePasswordModal } from "@/features/auth/components/ChangePasswordModal";
import { TwoFactorSection } from "@/features/auth/components/TwoFactorSection";
import { cn } from "@/lib/utils";
import {
  Building2,
  Clock,
  Mail,
  MapPin,
  FileText,
  Lock,
  ChevronRight,
  User,
  GraduationCap,
} from "lucide-react";
import PageWrapper from "@/shared/components/PageWrapper";

const NAV = [
  { id: "laboral",    label: "Laboral",    icon: Building2 },
  { id: "personal",   label: "Personal",   icon: User },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "seguridad",  label: "Seguridad",  icon: Lock },
] as const;

type NavId = (typeof NAV)[number]["id"];

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: userComplete } = useUserComplete(user.id);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [active, setActive] = useState<NavId>("laboral");

  if (!userComplete) return null;

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const notNull = (v?: string | null) => (v && v !== "NULL" ? v : undefined);

  const hasPrimary = [
    userComplete.primary_school,
    userComplete.primary_school_status,
  ].some(notNull);

  const hasSecondary = [
    userComplete.secondary_school,
    userComplete.secondary_school_status,
  ].some(notNull);

  const hasHigher = [
    userComplete.technical_university,
    userComplete.career,
    userComplete.study_city,
    userComplete.highest_degree,
    userComplete.study_cycle,
    userComplete.study_years,
    userComplete.degree_obtained,
  ].some(notNull);

  const hasFormacion = hasPrimary || hasSecondary || hasHigher;

  return (
    <PageWrapper>
      {/* ── Cabecera ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center sm:flex-row gap-5 sm:gap-6 py-2">
        <Avatar className="w-20 h-20 sm:w-[72px] sm:h-[72px] ring-4 ring-primary/10 shrink-0">
          <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
            {getInitials(userComplete.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-semibold tracking-tight">
            {userComplete.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {userComplete.position}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              {userComplete.company}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {userComplete.branch}
            </span>
            {userComplete.personal_email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                {userComplete.personal_email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + content ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-start">

        {/* Mobile: pill row */}
        <div className="flex md:hidden gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                active === id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {label}
              {id === "seguridad" && (
                <span className="text-[9px] font-bold bg-amber-400/30 text-amber-600 dark:text-amber-400 px-1 py-0.5 rounded-full leading-none">
                  Beta
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Desktop: sidebar */}
        <nav className="hidden md:flex flex-col gap-0.5 w-44 shrink-0">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors text-left",
                active === id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {id === "seguridad" && (
                <span className="text-[9px] font-bold uppercase tracking-wide bg-amber-400/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full leading-none">
                  Beta
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Content panel */}
        <div className="flex-1 min-w-0">

          {active === "laboral" && (
            <Section label="Laboral">
              <Field label="ID de empleado" value={userComplete.id} />
              <Field label="Rol del sistema" value={userComplete.role} />
              <Field label="Posición" value={userComplete.position} />
              <Field label="Compañía" value={userComplete.company} />
              <Field label="Sucursal" value={userComplete.branch} />
              <Field label="Fecha de inicio" value={userComplete.start_date} />
            </Section>
          )}

          {active === "personal" && (
            <div className="flex flex-col gap-4">
              <Section label="Personal">
                <Field label="Fecha de nacimiento" value={userComplete.birth_date} />
                <Field label="Lugar de nacimiento" value={userComplete.birthplace} />
                <Field label="Nacionalidad" value={userComplete.nationality} />
                <Field label="Género" value={userComplete.gender} />
                <Field label="Estado civil" value={userComplete.marital_status} />
                <Field label="N.º de hijos" value={userComplete.children_count} />
              </Section>
              <Section label="Contacto">
                <Field label="Correo personal" value={userComplete.personal_email} />
                <Field label="Teléfono personal" value={userComplete.personal_phone} />
                <Field label="Teléfono de casa" value={userComplete.home_phone} />
                <Field label="Referencia" value={userComplete.reference_phone} />
                <Field label="Dirección" value={userComplete.address} />
                <Field label="Ref. dirección" value={userComplete.address_reference} />
                <Field
                  label="Ubicación"
                  value={[
                    userComplete.district,
                    userComplete.province,
                    userComplete.department,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              </Section>
            </div>
          )}

          {active === "documentos" && (
            <div className="flex flex-col gap-4">
              <Section label="Documentos y Licencias">
                <Field label="Documento de identidad" value={userComplete.document} />
                <Field label="Pasaporte" value={userComplete.passport} />
                <Field label="Licencia de conducir" value={userComplete.license} />
                <Field label="Clase" value={userComplete.license_class} />
                <Field label="Categoría" value={userComplete.license_category} />
                <Field label="Mat. peligroso" value={userComplete.hazmat_license} />
              </Section>

              {hasFormacion ? (
                <Section label="Formación Académica">
                  {hasPrimary && (
                    <>
                      <SubLabel label="Primaria" />
                      <Field label="Institución" value={notNull(userComplete.primary_school)} />
                      <Field label="Estado" value={notNull(userComplete.primary_school_status)} />
                    </>
                  )}
                  {hasSecondary && (
                    <>
                      <SubLabel label="Secundaria" />
                      <Field label="Institución" value={notNull(userComplete.secondary_school)} />
                      <Field label="Estado" value={notNull(userComplete.secondary_school_status)} />
                    </>
                  )}
                  {hasHigher && (
                    <>
                      <SubLabel label="Superior" />
                      <Field label="Universidad / Instituto" value={notNull(userComplete.technical_university)} />
                      <Field label="Carrera" value={notNull(userComplete.career)} />
                      <Field label="Ciudad" value={notNull(userComplete.study_city)} />
                      <Field label="Grado obtenido" value={notNull(userComplete.highest_degree)} />
                      <Field label="Ciclo actual" value={notNull(userComplete.study_cycle)} />
                      <Field label="Años de estudio" value={notNull(userComplete.study_years)} />
                      <Field label="Título" value={notNull(userComplete.degree_obtained)} />
                    </>
                  )}
                </Section>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                  <GraduationCap className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">Sin información académica registrada</p>
                </div>
              )}

              <Section label="Curriculum Vitae">
                <div className="flex items-center justify-between px-4 py-3.5 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-xl bg-orange-500/10 dark:bg-orange-500/15 p-2 shrink-0">
                      <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {userComplete.cv_file || "Sin archivo adjunto"}
                      </p>
                      {userComplete.cv_last_update && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 shrink-0" />
                          Actualizado {userComplete.cv_last_update}
                        </p>
                      )}
                    </div>
                  </div>
                  {userComplete.cv_file && (
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 shrink-0">
                      Disponible
                    </span>
                  )}
                </div>
              </Section>
            </div>
          )}

          {active === "seguridad" && (
            <Section label="Seguridad">
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/80 transition-colors text-left"
              >
                <div className="rounded-xl bg-blue-500/10 dark:bg-blue-500/15 p-2 shrink-0">
                  <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Contraseña</p>
                  <p className="text-xs text-muted-foreground">
                    Actualiza tu contraseña regularmente
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              </button>
              <TwoFactorSection />
            </Section>
          )}

        </div>
      </div>

      <ChangePasswordModal
        open={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        isForced={false}
      />
    </PageWrapper>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function Section({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-1">
        {label}
      </p>
      <div className="rounded-2xl overflow-hidden bg-muted/50 divide-y divide-border/30">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (value === null || value === undefined || value === "" || value === "-")
    return null;
  return (
    <div className="flex items-baseline gap-3 px-4 py-2">
      <span className="text-sm text-muted-foreground w-36 shrink-0 leading-snug">
        {label}
      </span>
      <span className="text-sm font-medium flex-1 wrap-break-word leading-snug">
        {value}
      </span>
    </div>
  );
}

function SubLabel({ label }: { label: string }) {
  return (
    <div className="px-4 py-1.5 bg-muted/80">
      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
