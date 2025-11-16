import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const vacations = {
  available: 15,
  used: 8,
  pending: 2,
  nextVacation: "15 de Julio, 2024",
};

export default function VacationPage() {
  return (
    <div className="space-y-6 w-full">
      <h3 className="text-xl font-bold text-primary">Gestión de Vacaciones</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">
              Días Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {vacations.available}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">
              Días Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary">
              {vacations.used}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">
              Días Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {vacations.pending}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Próximas Vacaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            <span className="font-medium">{vacations.nextVacation}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
