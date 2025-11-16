"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/src/features/auth/lib/auth.store";
import { useUserComplete } from "@/src/features/gp/gestionsistema/usuarios/lib/user.hook";
import {
  Building2,
  Clock,
  Mail,
  MapPin,
  User,
  GraduationCap,
  FileText,
  IdCard,
  Briefcase,
  Phone,
  Calendar,
  Globe,
  Heart,
  Users,
} from "lucide-react";

export default function UserPage() {
  const { user } = useAuthStore();
  const { data: userComplete } = useUserComplete(user.id);

  if (!userComplete) return null;

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
        {/* Contact Information */}
        <Card className="col-span-4 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Info
              label="Nombre Completo"
              value={userComplete.name}
              icon={<User className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Email"
              value={userComplete.personal_email}
              icon={<Mail className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Teléfono"
              value={userComplete.personal_phone}
              icon={<Phone className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Teléfono de Referencia"
              value={userComplete.reference_phone}
              icon={<Phone className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Teléfono de Casa"
              value={userComplete.home_phone}
              icon={<Phone className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Dirección"
              value={userComplete.address}
              icon={<MapPin className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Dirección de Referencia"
              value={userComplete.address_reference}
              icon={<MapPin className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Ubicación"
              value={`${userComplete.district} / ${userComplete.province} / ${userComplete.department}`}
              icon={<MapPin className="w-4 h-4 text-tertiary" />}
            />
          </CardContent>
        </Card>

        {/* Job Information */}
        <Card className="col-span-4 xl:col-span-2 2xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Job Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Info
              label="ID de Empleado"
              value={userComplete.id}
              icon={<IdCard className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Rol"
              value={userComplete.role}
              icon={<User className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Compañía"
              value={userComplete.company}
              icon={<Building2 className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Sucursal"
              value={userComplete.branch}
              icon={<MapPin className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Posición"
              value={userComplete.position}
              icon={<Briefcase className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Fecha de Inicio"
              value={userComplete.start_date}
              icon={<Clock className="w-4 h-4 text-tertiary" />}
            />
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="col-span-4 xl:col-span-4 2xl:col-span-1 2xl:row-span-2">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Education
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 grid-cols-1 xl:grid-cols-2 2xl:grid-cols-1">
            <div className="grid gap-3">
              <Info
                label="Escuela Primaria"
                value={userComplete.primary_school}
                icon={<GraduationCap className="w-4 h-4 text-tertiary" />}
              />
              <Info
                label="Estado de la Escuela Primaria"
                value={userComplete.primary_school_status}
                icon={<GraduationCap className="w-4 h-4 text-tertiary" />}
              />
              <Info
                label="Escuela Secundaria"
                value={userComplete.secondary_school}
                icon={<GraduationCap className="w-4 h-4 text-tertiary" />}
              />
              <Info
                label="Estado de la Escuela Secundaria"
                value={userComplete.secondary_school_status}
                icon={<GraduationCap className="w-4 h-4 text-tertiary" />}
              />
              <Info
                label="Universidad/Instituto"
                value={userComplete.technical_university}
                icon={<GraduationCap className="w-4 h-4 text-tertiary" />}
              />
              <Info
                label="Carrera"
                value={userComplete.career}
                icon={<GraduationCap className="w-4 h-4 text-tertiary" />}
              />
            </div>
            <div className="grid gap-3">
              <Info
                label="Ciudad de Estudio"
                value={userComplete.study_city}
                icon={<MapPin className="w-4 h-4 text-tertiary" />}
              />
              <Info
                label="Grado Más Alto"
                value={userComplete.highest_degree}
                icon={<GraduationCap className="w-4 h-4 text-tertiary" />}
              />
              <Info
                label="Ciclo de Estudios"
                value={userComplete.study_cycle}
                icon={<GraduationCap className="w-4 h-4 text-tertiary" />}
              />
              <Info label="Años de Estudio" value={userComplete.study_years} />
              <Info
                label="Título Obtenido"
                value={userComplete.degree_obtained}
                icon={<GraduationCap className="w-4 h-4 text-tertiary" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="col-span-4 xl:col-span-2 2xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Info
              label="Fecha de Nacimiento"
              value={userComplete.birth_date}
              icon={<Calendar className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Nacionalidad"
              value={userComplete.nationality}
              icon={<Globe className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Género"
              value={userComplete.gender}
              icon={<User className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Estado Civil"
              value={userComplete.marital_status}
              icon={<Heart className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Hijos"
              value={userComplete.children_count}
              icon={<Users className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Lugar de Nacimiento"
              value={userComplete.birthplace}
              icon={<MapPin className="w-4 h-4 text-tertiary" />}
            />
          </CardContent>
        </Card>

        {/* Documents & Licenses */}
        <Card className="col-span-4 xl:col-span-2 2xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <IdCard className="w-5 h-5" />
              Documents & Licenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Info
              label="Documento (DNI)"
              value={userComplete.document}
              icon={<IdCard className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Pasaporte"
              value={userComplete.passport}
              icon={<IdCard className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Licencia de Conducir"
              value={userComplete.license}
              icon={<IdCard className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Licencia de Material Peligroso"
              value={userComplete.hazmat_license}
              icon={<IdCard className="w-4 h-4 text-tertiary" />}
            />
            <Info
              label="Clase y Categoría de Licencia"
              value={`${userComplete.license_class} - ${userComplete.license_category}`}
              icon={<IdCard className="w-4 h-4 text-tertiary" />}
            />
          </CardContent>
        </Card>

        {/* Curriculum Vitae */}
        <Card className="col-span-4 xl:col-span-4 2xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Curriculum Vitae
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Info
              label="Currículum Vitae"
              value={userComplete.cv_file ?? "No file uploaded"}
              icon={<FileText className="w-4 h-4 text-secondary" />}
            />
            <Info
              label="Última Actualización"
              value={userComplete.cv_last_update}
              icon={<Clock className="w-4 h-4 text-secondary" />}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Componente auxiliar para evitar repetición */
function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium flex items-center gap-1">
        {icon}
        {value}
      </p>
    </div>
  );
}
