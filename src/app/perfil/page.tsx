"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useUserComplete } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
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
  ShieldCheck,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: userComplete } = useUserComplete(user.id);

  if (!userComplete) return null;

  // Obtener iniciales para el avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 w-full p-6">
      {/* Header con información del usuario */}
      <Card className="col-span-full">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-primary/10">
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {getInitials(userComplete.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-3xl font-bold text-primary">
                  {userComplete.name}
                </h1>
                <Badge variant="secondary" className="w-fit">
                  {userComplete.position}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{userComplete.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{userComplete.branch}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{userComplete.personal_email}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Información de Contacto */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Información de Contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Correo Personal"
                value={userComplete.personal_email}
                icon={<Mail className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Teléfono Personal"
                value={userComplete.personal_phone}
                icon={<Phone className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Teléfono de Casa"
                value={userComplete.home_phone}
                icon={<Phone className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Teléfono de Referencia"
                value={userComplete.reference_phone}
                icon={<Phone className="w-4 h-4 text-primary" />}
              />
            </div>
            <Separator />
            <div className="space-y-3">
              <InfoItem
                label="Dirección Principal"
                value={userComplete.address}
                icon={<MapPin className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Referencia de Dirección"
                value={userComplete.address_reference}
                icon={<MapPin className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Ubicación"
                value={`${userComplete.district}, ${userComplete.province}, ${userComplete.department}`}
                icon={<MapPin className="w-4 h-4 text-primary" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información Laboral */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Información Laboral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="ID de Empleado"
                value={userComplete.id}
                icon={<IdCard className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Rol del Sistema"
                value={userComplete.role}
                icon={<ShieldCheck className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Compañía"
                value={userComplete.company}
                icon={<Building2 className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Sucursal"
                value={userComplete.branch}
                icon={<MapPin className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Posición"
                value={userComplete.position}
                icon={<Briefcase className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Fecha de Inicio"
                value={userComplete.start_date}
                icon={<Clock className="w-4 h-4 text-primary" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información Personal */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Fecha de Nacimiento"
                value={userComplete.birth_date}
                icon={<Calendar className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Lugar de Nacimiento"
                value={userComplete.birthplace}
                icon={<MapPin className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Nacionalidad"
                value={userComplete.nationality}
                icon={<Globe className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Género"
                value={userComplete.gender}
                icon={<User className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Estado Civil"
                value={userComplete.marital_status}
                icon={<Heart className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Número de Hijos"
                value={userComplete.children_count}
                icon={<Users className="w-4 h-4 text-primary" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Documentos y Licencias */}
        <Card className="lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <IdCard className="w-5 h-5" />
              Documentos y Licencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Documento de Identidad"
                value={userComplete.document}
                icon={<IdCard className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Pasaporte"
                value={userComplete.passport}
                icon={<IdCard className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Licencia de Conducir"
                value={userComplete.license}
                icon={<IdCard className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Clase de Licencia"
                value={userComplete.license_class}
                icon={<IdCard className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Categoría de Licencia"
                value={userComplete.license_category}
                icon={<IdCard className="w-4 h-4 text-primary" />}
              />
              <InfoItem
                label="Licencia de Material Peligroso"
                value={userComplete.hazmat_license}
                icon={<ShieldCheck className="w-4 h-4 text-primary" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Educación */}
        <Card className="lg:col-span-12">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Formación Académica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Educación Primaria */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Educación Primaria
                </h3>
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  {userComplete.primary_school &&
                    userComplete.primary_school !== "NULL" && (
                      <InfoItem
                        label="Institución"
                        value={userComplete.primary_school}
                      />
                    )}

                  {userComplete.primary_school_status &&
                    userComplete.primary_school_status !== "NULL" && (
                      <InfoItem
                        label="Estado"
                        value={userComplete.primary_school_status}
                      />
                    )}
                </div>
              </div>

              {/* Educación Secundaria */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Educación Secundaria
                </h3>
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  {userComplete.secondary_school &&
                    userComplete.secondary_school !== "NULL" && (
                      <InfoItem
                        label="Institución"
                        value={userComplete.secondary_school}
                      />
                    )}
                  {userComplete.secondary_school_status &&
                    userComplete.secondary_school_status !== "NULL" && (
                      <InfoItem
                        label="Estado"
                        value={userComplete.secondary_school_status}
                      />
                    )}
                </div>
              </div>

              {/* Educación Superior */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Educación Superior
                </h3>
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  {userComplete.technical_university &&
                    userComplete.technical_university !== "NULL" && (
                      <InfoItem
                        label="Universidad/Instituto"
                        value={userComplete.technical_university}
                      />
                    )}

                  {userComplete.career && userComplete.career !== "NULL" && (
                    <InfoItem label="Carrera" value={userComplete.career} />
                  )}

                  {userComplete.study_city &&
                    userComplete.study_city !== "NULL" && (
                      <InfoItem
                        label="Ciudad"
                        value={userComplete.study_city}
                      />
                    )}

                  {userComplete.highest_degree &&
                    userComplete.highest_degree !== "NULL" && (
                      <InfoItem
                        label="Grado Obtenido"
                        value={userComplete.highest_degree}
                      />
                    )}
                  {userComplete.study_cycle &&
                    userComplete.study_cycle !== "NULL" && (
                      <InfoItem
                        label="Ciclo Actual"
                        value={userComplete.study_cycle}
                      />
                    )}

                  {userComplete.study_years &&
                    userComplete.study_years !== "NULL" && (
                      <InfoItem
                        label="Años de Estudio"
                        value={userComplete.study_years}
                      />
                    )}

                  {userComplete.degree_obtained &&
                    userComplete.degree_obtained !== "NULL" && (
                      <InfoItem
                        label="Título"
                        value={userComplete.degree_obtained}
                      />
                    )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Curriculum Vitae */}
        <Card className="lg:col-span-12">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Curriculum Vitae
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {userComplete.cv_file || "No se ha subido ningún archivo"}
                  </p>
                  {userComplete.cv_last_update && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Última actualización: {userComplete.cv_last_update}
                    </p>
                  )}
                </div>
              </div>
              {userComplete.cv_file && (
                <Badge variant="outline" className="text-xs">
                  Disponible
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Componente auxiliar mejorado para mostrar información */
function InfoItem({
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
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
