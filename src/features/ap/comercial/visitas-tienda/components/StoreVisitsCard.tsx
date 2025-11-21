import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  User,
  Building2,
  Car,
  UserCog,
} from "lucide-react";
import { StoreVisitsResource } from "../lib/storeVisits.interface";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { STORE_VISITS } from "../lib/storeVisits.constants";

interface Props {
  data: StoreVisitsResource;
  index: number;
  onDelete: (id: number) => void;
  enableContactIcons?: boolean;
}

export default function StoreVisitsCard({
  data,
  onDelete,
  enableContactIcons = false,
}: Props) {
  const router = useNavigate();
  const { ROUTE_UPDATE } = STORE_VISITS;

  const hasPhone = data.phone && data.phone.trim() !== "";
  const hasEmail = data.email && data.email.trim() !== "";

  const formatPhoneForLinks = (phone: string) => {
    return phone.replace(/[\s\-()]/g, "");
  };

  return (
    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-0">
        {/* Header con fecha destacada */}
        <div className="bg-linear-to-r bg-primary px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-100 uppercase tracking-wide">
                  Fecha de Registro
                </p>
                <p className="text-lg font-bold">
                  {typeof data.registration_date === "string"
                    ? data.registration_date
                    : data.registration_date instanceof Date
                    ? data.registration_date.toLocaleDateString()
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-4">
          {/* Nombre destacado */}
          <div className="mb-4">
            <div className="flex items-start gap-2">
              <div className="bg-blue-50 p-2.5 rounded-lg">
                <User className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Cliente
                </p>
                <h3 className="text-lg font-bold text-gray-900">
                  {data.full_name || "-"}
                </h3>
              </div>
            </div>
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {/* Sede */}
            {(data as any).sede && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <Building2 className="size-4 text-gray-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Sede
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {(data as any).sede || "-"}
                  </p>
                </div>
              </div>
            )}

            {/* Marca Vehículo */}
            {(data as any).vehicle_brand && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <Car className="size-4 text-gray-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Marca Vehículo
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {(data as any).vehicle_brand || "-"}
                  </p>
                </div>
              </div>
            )}

            {/* Asesor */}
            {(data as any).worker && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 md:col-span-2">
                <UserCog className="size-4 text-gray-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Asesor Asignado
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {(data as any).worker || "-"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Información de contacto */}
          <div className="space-y-4 p-4 rounded-lg border border-gray-200 bg-linear-to-br from-gray-50 to-white">
            <p className="text-sm font-bold text-gray-900 mb-3">
              Información de Contacto
            </p>

            {/* Teléfono */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Phone className="size-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Teléfono</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {data.phone || "Sin teléfono"}
                  </p>
                </div>
              </div>
              {enableContactIcons && hasPhone && (
                <div className="flex gap-2 ml-11">
                  <Button
                    size="sm"
                    className="h-9 gap-2 text-xs font-medium bgprimary text-white"
                    asChild
                  >
                    <Link to={`tel:+51${formatPhoneForLinks(data.phone)}`}>
                      <Phone className="size-3.5" />
                      Llamar
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 gap-2 text-xs font-medium bg-green-700 hover:bg-green-700 text-white"
                    asChild
                  >
                    <Link
                      to={`https://wa.me/51${formatPhoneForLinks(data.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="size-3.5" />
                      WhatsApp
                    </Link>
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
                    {data.email || "Sin correo"}
                  </p>
                </div>
              </div>
              {enableContactIcons && hasEmail && (
                <div className="ml-11">
                  <Button
                    size="sm"
                    className="h-9 gap-2 text-xs font-medium bg-secondary hover:bg-secondary text-white"
                    asChild
                  >
                    <Link to={`mailto:${data.email}`}>
                      <Mail className="size-3.5" />
                      Enviar correo
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-t">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 font-medium hover:bg-white"
            onClick={() => router(`${ROUTE_UPDATE}/${data.id}`)}
          >
            <Pencil className="size-4" />
          </Button>
          <DeleteButton onClick={() => onDelete(data.id)} />
        </div>
      </CardContent>
    </Card>
  );
}
