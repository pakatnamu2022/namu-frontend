import {
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  GraduationCap,
  User,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const profileData = {
  training: [
    {
      title: "Seguridad Industrial",
      status: "completed",
      date: "2024-01-15",
      progress: 100,
    },
    {
      title: "Gestión de Calidad",
      status: "in-progress",
      date: "2024-02-01",
      progress: 75,
    },
    {
      title: "Liderazgo Empresarial",
      status: "pending",
      date: "2024-03-01",
      progress: 0,
    },
  ],
  documents: [
    {
      name: "Contrato de Trabajo",
      type: "PDF",
      size: "2.3 MB",
      date: "2020-03-15",
    },
    {
      name: "Certificado de Capacitación",
      type: "PDF",
      size: "1.1 MB",
      date: "2024-01-15",
    },
    {
      name: "Evaluación de Desempeño",
      type: "PDF",
      size: "890 KB",
      date: "2023-12-20",
    },
  ],
  vacations: {
    available: 15,
    used: 8,
    pending: 2,
    nextVacation: "15 de Julio, 2024",
  },
};

export default function ProfileInfo() {
  return (
    <div className="space-y-6">
      {/* Información personal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <User className="w-5 h-5" /> Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">juan.perez@empresa.com</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teléfono</p>
            <p className="font-medium">+54 11 1234-5678</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ID Empleado</p>
            <p className="font-medium">EMP-001</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fecha de Ingreso</p>
            <p className="font-medium">15 de Marzo, 2020</p>
          </div>
        </CardContent>
      </Card>

      {/* Capacitaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <GraduationCap className="w-5 h-5" /> Capacitaciones Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profileData.training.map((training, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      training.status === "completed"
                        ? "bg-green-100"
                        : training.status === "in-progress"
                        ? "bg-yellow-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {training.status === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : training.status === "in-progress" ? (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-primary">
                      {training.title}
                    </h4>
                    <p className="text-sm text-gray-500">{training.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{training.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <FileText className="w-5 h-5" /> Documentos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profileData.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary">{doc.name}</h4>
                    <p className="text-sm text-gray-500">
                      {doc.type} • {doc.size} • {doc.date}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vacaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Gestión de Vacaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {profileData.vacations.available}
              </p>
              <p className="text-sm text-gray-600">Días Disponibles</p>
            </div>
            <div className="text-center p-4 bg-secondary/5 rounded-lg">
              <p className="text-2xl font-bold text-secondary">
                {profileData.vacations.used}
              </p>
              <p className="text-sm text-gray-600">Días Utilizados</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {profileData.vacations.pending}
              </p>
              <p className="text-sm text-gray-600">Días Pendientes</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Próximas Vacaciones:</p>
            <p className="font-medium text-primary">
              {profileData.vacations.nextVacation}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
