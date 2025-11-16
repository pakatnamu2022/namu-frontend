import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format, parse } from "date-fns";
import { CakeSlice, IdCard, Mail, MapPin, Phone, User } from "lucide-react";
import { CustomersResource } from "../../clientes/lib/customers.interface";
import { es } from "date-fns/locale";

interface Props {
  data: CustomersResource;
}

export default function OpportunityClientCard({ data }: Props) {
  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <h3 className="text-base font-semibold text-primary">
          Información del Cliente
        </h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2 md:col-span-2">
            <User className="size-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Nombre completo</p>
              <p className="text-sm font-medium">{data.full_name}</p>
            </div>
          </div>

          {data.email && (
            <div className="flex items-start gap-2">
              <Mail className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Correo</p>
                <p className="text-sm font-medium break-all">{data.email}</p>
              </div>
            </div>
          )}
          {data.phone && (
            <div className="flex items-start gap-2">
              <Phone className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="text-sm font-medium">{data.phone}</p>
              </div>
            </div>
          )}
          {data.num_doc && (
            <div className="flex items-start gap-2">
              <IdCard className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">DNI</p>
                <p className="text-sm font-medium">{data.num_doc}</p>
              </div>
            </div>
          )}

          {data.birth_date && (
            <div className="flex items-start gap-2">
              <CakeSlice className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Fecha de Nacimiento
                </p>
                <p className="text-sm font-medium">
                  {format(
                    parse(data.birth_date, "yyyy-MM-dd", new Date()),
                    "PPP",
                    { locale: es }
                  )}
                </p>
              </div>
            </div>
          )}

          {data.direction && (
            <div className="flex items-start gap-2 md:col-span-2">
              <MapPin className="size-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Dirección</p>
                <p className="text-sm font-medium">{data.direction}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
