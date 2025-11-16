import { useQuery } from "@tanstack/react-query";
import {
  AgendaResponse,
} from "./agenda.interface";
import { AGENDA } from "./agenda.constants";

const { QUERY_KEY } = AGENDA;

// Función para simular datos de agenda (para desarrollo)
const getMockAgendaData = (userId?: number): Promise<AgendaResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: AgendaResponse = {
        data: [
          {
            id: 1,
            titulo: "Reunión con Cliente Potencial",
            descripcion: "Presentación de productos para nuevo cliente corporativo",
            fecha_inicio: "2024-12-15",
            fecha_fin: "2024-12-15",
            hora_inicio: "09:00",
            hora_fin: "10:30",
            cliente_id: 1,
            cliente_nombre: "Juan Pérez",
            cliente_telefono: "987654321",
            cliente_email: "juan.perez@email.com",
            tipo_cita: "presentacion",
            estado: "programada",
            prioridad: "alta",
            ubicacion: "Oficina Principal",
            notas: "Llevar catálogo actualizado y propuesta comercial",
            recordatorio: 30,
            created_by: userId || 1,
            created_at: "2024-12-01T10:00:00Z",
            updated_at: "2024-12-01T10:00:00Z",
          },
          {
            id: 2,
            titulo: "Seguimiento de Propuesta",
            descripcion: "Revisión del estado de la propuesta enviada la semana pasada",
            fecha_inicio: "2024-12-16",
            fecha_fin: "2024-12-16",
            hora_inicio: "14:00",
            hora_fin: "15:00",
            cliente_id: 2,
            cliente_nombre: "María García",
            cliente_telefono: "123456789",
            cliente_email: "maria.garcia@empresa.com",
            tipo_cita: "seguimiento",
            estado: "programada",
            prioridad: "media",
            ubicacion: "Videoconferencia",
            notas: "Revisar observaciones del comité de compras",
            recordatorio: 15,
            created_by: userId || 1,
            created_at: "2024-12-02T11:00:00Z",
            updated_at: "2024-12-02T11:00:00Z",
          },
          {
            id: 3,
            titulo: "Consulta Técnica",
            descripcion: "Asesoría sobre especificaciones técnicas del producto",
            fecha_inicio: "2024-12-18",
            fecha_fin: "2024-12-18",
            hora_inicio: "11:00",
            hora_fin: "12:00",
            cliente_id: 3,
            cliente_nombre: "Carlos López",
            cliente_telefono: "555666777",
            cliente_email: "carlos.lopez@tech.com",
            tipo_cita: "consulta",
            estado: "completada",
            prioridad: "baja",
            ubicacion: "Sede Norte",
            notas: "Cliente interesado en especificaciones avanzadas",
            recordatorio: 15,
            created_by: userId || 1,
            created_at: "2024-12-03T09:00:00Z",
            updated_at: "2024-12-03T09:00:00Z",
          },
        ],
        links: {
          first: "",
          last: "",
          prev: null,
          next: "",
        },
        meta: {
          current_page: 1,
          from: 1,
          last_page: 1,
          links: [],
          path: "",
          per_page: 15,
          to: 3,
          total: 3,
        },
      };
      resolve(mockData);
    }, 1000);
  });
};

export const useAgenda = (params?: Record<string, any>) => {
  return useQuery<AgendaResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getMockAgendaData(),
    refetchOnWindowFocus: false,
  });
};

export const useAgendaForCurrentUser = (userId?: number) => {
  return useQuery<AgendaResponse>({
    queryKey: [QUERY_KEY, "currentUser", userId],
    queryFn: () => getMockAgendaData(userId),
    refetchOnWindowFocus: false,
    enabled: !!userId, // Solo ejecutar si tenemos userId
  });
};

// Hook para obtener agenda por rango de fechas
export const useAgendaByDateRange = (
  startDate: string, 
  endDate: string, 
  userId?: number
) => {
  return useQuery<AgendaResponse>({
    queryKey: [QUERY_KEY, "dateRange", startDate, endDate, userId],
    queryFn: () => getMockAgendaData(userId),
    refetchOnWindowFocus: false,
    enabled: !!(startDate && endDate), // Solo ejecutar si tenemos fechas
  });
};