"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  GraduationCap,
  FileText,
  BookOpen,
  Calendar,
  HelpCircle,
  Shield,
  Mail,
  MapPin,
  Building2,
  Clock,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const profileData = {
  personal: {
    name: "Juan Carlos Pérez",
    email: "juan.perez@empresa.com",
    phone: "+54 11 1234-5678",
    position: "Administrador General",
    department: "Administración",
    location: "Buenos Aires, Argentina",
    startDate: "15 de Marzo, 2020",
    employeeId: "EMP-001",
    avatar: "/placeholder.svg?height=100&width=100",
  },
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
    {
      title: "Sistemas de Gestión",
      status: "completed",
      date: "2023-12-10",
      progress: 100,
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
    {
      name: "Manual del Empleado",
      type: "PDF",
      size: "5.2 MB",
      date: "2024-01-01",
    },
  ],
  onboarding: [
    { task: "Completar información personal", completed: true },
    { task: "Revisar políticas de la empresa", completed: true },
    { task: "Configurar consultar_roles al sistema", completed: true },
    { task: "Reunión con supervisor directo", completed: true },
    { task: "Capacitación en seguridad", completed: false },
  ],
  vacations: {
    available: 15,
    used: 8,
    pending: 2,
    nextVacation: "15 de Julio, 2024",
  },
  helpDesk: [
    {
      ticket: "#HD-001",
      subject: "Problema con acceso al sistema",
      status: "resolved",
      date: "2024-01-10",
    },
    {
      ticket: "#HD-002",
      subject: "Solicitud de nuevo equipo",
      status: "in-progress",
      date: "2024-01-20",
    },
    {
      ticket: "#HD-003",
      subject: "Capacitación adicional",
      status: "pending",
      date: "2024-01-25",
    },
  ],
  policies: [
    {
      name: "Código de Conducta",
      version: "v2.1",
      date: "2024-01-01",
      read: true,
    },
    {
      name: "Política de Seguridad",
      version: "v1.5",
      date: "2023-12-15",
      read: true,
    },
    {
      name: "Manual de Procedimientos",
      version: "v3.0",
      date: "2024-02-01",
      read: false,
    },
    {
      name: "Política de Privacidad",
      version: "v1.2",
      date: "2023-11-20",
      read: true,
    },
  ],
};

const menuItems = [
  { id: "profile", label: "Información de Perfil", icon: User },
  { id: "training", label: "Capacitaciones", icon: GraduationCap },
  { id: "documents", label: "Documentación", icon: FileText },
  { id: "onboarding", label: "Onboarding", icon: BookOpen },
  { id: "vacations", label: "Vacaciones", icon: Calendar },
  { id: "helpdesk", label: "Mesa de Ayuda", icon: HelpCircle },
  { id: "policies", label: "Políticas Empresariales", icon: Shield },
];

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const [activeSection, setActiveSection] = useState("profile");

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary">
                  {profileData.personal.name}
                </h3>
                <p className="text-gray-600">{profileData.personal.position}</p>
                <Badge className="bg-secondary text-white">
                  {profileData.personal.department}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profileData.personal.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{profileData.personal.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-secondary" />
                      {profileData.personal.location}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Información Laboral
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">ID Empleado</p>
                    <p className="font-medium">
                      {profileData.personal.employeeId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Ingreso</p>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4 text-secondary" />
                      {profileData.personal.startDate}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "training":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-primary">Capacitaciones</h3>
              <Badge className="bg-secondary text-white">
                {
                  profileData.training.filter((t) => t.status === "completed")
                    .length
                }{" "}
                Completadas
              </Badge>
            </div>
            <div className="grid gap-4">
              {profileData.training.map((training, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            training.status === "completed"
                              ? "bg-green-100"
                              : training.status === "in-progress"
                              ? "bg-yellow-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {training.status === "completed" ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : training.status === "in-progress" ? (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary">
                            {training.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {training.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {training.progress}%
                        </p>
                        <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-full bg-secondary rounded-full transition-all duration-300"
                            style={{ width: `${training.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "documents":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">Documentación</h3>
            <div className="grid gap-3">
              {profileData.documents.map((doc, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary">
                            {doc.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {doc.type} • {doc.size} • {doc.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "onboarding":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-primary">
                Proceso de Onboarding
              </h3>
              <Badge className="bg-secondary text-white">
                {profileData.onboarding.filter((t) => t.completed).length}/
                {profileData.onboarding.length} Completado
              </Badge>
            </div>
            <div className="space-y-3">
              {profileData.onboarding.map((task, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      task.completed ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    {task.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      task.completed ? "text-gray-700" : "text-primary"
                    }`}
                  >
                    {task.task}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case "vacations":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-primary">
              Gestión de Vacaciones
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">
                    Días Disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">
                    {profileData.vacations.available}
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
                    {profileData.vacations.used}
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
                    {profileData.vacations.pending}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-primary">
                  Próximas Vacaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-secondary" />
                  <span className="font-medium">
                    {profileData.vacations.nextVacation}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "helpdesk":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-primary">Mesa de Ayuda</h3>
              <Button className="bg-secondary hover:bg-secondary/90 text-white">
                Nuevo Ticket
              </Button>
            </div>
            <div className="grid gap-3">
              {profileData.helpDesk.map((ticket, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-primary">
                            {ticket.ticket}
                          </span>
                          <Badge
                            className={
                              ticket.status === "resolved"
                                ? "bg-green-100 text-green-700"
                                : ticket.status === "in-progress"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {ticket.status === "resolved"
                              ? "Resuelto"
                              : ticket.status === "in-progress"
                              ? "En Progreso"
                              : "Pendiente"}
                          </Badge>
                        </div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-gray-500">{ticket.date}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "policies":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary">
              Políticas Empresariales
            </h3>
            <div className="grid gap-3">
              {profileData.policies.map((policy, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            policy.read ? "bg-green-100" : "bg-secondary/10"
                          }`}
                        >
                          <Shield
                            className={`w-5 h-5 ${
                              policy.read ? "text-green-600" : "text-secondary"
                            }`}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-primary">
                            {policy.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {policy.version} • {policy.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {policy.read ? (
                          <Badge className="bg-green-100 text-green-700">
                            Leído
                          </Badge>
                        ) : (
                          <Badge className="bg-secondary text-white">
                            Pendiente
                          </Badge>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">
            Panel de Usuario
          </DialogTitle>
          <DialogDescription>
            Gestiona tu información personal, capacitaciones y documentación
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 h-[70vh]">
          {/* Sidebar del modal */}
          <div className="w-64 border-r border-gray-200 pr-4">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 overflow-y-auto">{renderContent()}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
