export const feedData = [
  {
    id: 1,
    user: {
      name: "María González",
      position: "Operadora de Transporte",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "¡Excelente capacitación de seguridad industrial hoy! Aprendimos nuevos protocolos que nos ayudarán a mejorar nuestros procesos diarios. 🚛✨",
    timestamp: "Hace 2 horas",
    likes: 12,
    comments: [
      {
        user: "Carlos Ruiz",
        content: "¡Totalmente de acuerdo! Los nuevos protocolos son muy útiles.",
        timestamp: "Hace 1 hora",
      },
      {
        user: "Ana López",
        content: "Me alegra saber que están implementando mejoras continuas.",
        timestamp: "Hace 30 min",
      },
    ],
    image: "/placeholder.svg?height=300&width=500",
  },
  {
    id: 2,
    user: {
      name: "Roberto Silva",
      position: "Supervisor de Depósito",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Nuevo récord en el depósito: procesamos 500 órdenes en un solo día. ¡Felicitaciones a todo el equipo! 📦🎉",
    timestamp: "Hace 4 horas",
    likes: 25,
    comments: [
      {
        user: "Laura Martín",
        content: "¡Increíble trabajo en equipo!",
        timestamp: "Hace 3 horas",
      },
    ],
  },
  {
    id: 3,
    user: {
      name: "Ana López",
      position: "Gerente de RRHH",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Recordatorio: La evaluación de desempeño anual comenzará la próxima semana. Por favor, preparen sus autoevaluaciones. 📋",
    timestamp: "Hace 6 horas",
    likes: 8,
    comments: [],
  },
  {
    id: 4,
    user: {
      name: "Diego Fernández",
      position: "Técnico Automotriz",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Completé la reparación del vehículo #VH-150 antes de lo programado. El cliente quedó muy satisfecho con el servicio. 🔧⚡",
    timestamp: "Hace 8 horas",
    likes: 15,
    comments: [
      {
        user: "Miguel Torres",
        content: "¡Excelente trabajo, Diego!",
        timestamp: "Hace 7 horas",
      },
    ],
  },
]

export const currentUser = {
  name: "Juan Carlos Pérez",
  avatar: "/placeholder.svg?height=40&width=40",
}
