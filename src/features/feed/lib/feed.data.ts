import { PostResource } from "./feed.interface";

export const feedData: PostResource[] = [
  {
    id: 1,
    user: {
      name: "María González",
      position: "Operadora de Transporte",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Transporte",
    },
    content:
      "¡Excelente capacitación de seguridad industrial hoy! Aprendimos nuevos protocolos que nos ayudarán a mejorar nuestros procesos diarios. 🚛✨ #Capacitacion #Seguridad",
    timestamp: "Hace 2 horas",
    likes: 12,
    comments: [
      {
        user: "Carlos Ruiz",
        content:
          "¡Totalmente de acuerdo! Los nuevos protocolos son muy útiles.",
        timestamp: "Hace 1 hora",
      },
      {
        user: "Ana López",
        content: "Me alegra saber que están implementando mejoras continuas.",
        timestamp: "Hace 30 min",
      },
    ],
    image: "/placeholder.svg?height=300&width=600",
    type: "training",
  },
  {
    id: 2,
    user: {
      name: "Roberto Silva",
      position: "Supervisor de Depósito",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Depósito",
    },
    content:
      "Nuevo récord en el depósito: procesamos 500 órdenes en un solo día. ¡Felicitaciones a todo el equipo! 📦🎉 #Record #Equipo #Deposito",
    timestamp: "Hace 4 horas",
    likes: 25,
    comments: [
      {
        user: "Laura Martín",
        content: "¡Increíble trabajo en equipo!",
        timestamp: "Hace 3 horas",
      },
    ],
    type: "achievement",
  },
  {
    id: 3,
    user: {
      name: "Ana López",
      position: "Gerente de RRHH",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "RRHH",
    },
    content:
      "Recordatorio: La evaluación de desempeño anual comenzará la próxima semana. Por favor, preparen sus autoevaluaciones. 📋 #RRHH #Evaluacion",
    timestamp: "Hace 6 horas",
    likes: 8,
    comments: [],
    type: "announcement",
  },
  {
    id: 4,
    user: {
      name: "Diego Fernández",
      position: "Técnico Automotriz",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Automotores",
    },
    content:
      "Completé la reparación del vehículo #VH-150 antes de lo programado. El cliente quedó muy satisfecho con el servicio. 🔧⚡ #Automotores #Servicio",
    timestamp: "Hace 8 horas",
    likes: 15,
    comments: [
      {
        user: "Miguel Torres",
        content: "¡Excelente trabajo, Diego!",
        timestamp: "Hace 7 horas",
      },
    ],
    type: "work",
  },
  {
    id: 5,
    user: {
      name: "Carmen Rodríguez",
      position: "Contadora",
      avatar: "/placeholder.svg?height=40&width=40",
      department: "Finanzas",
    },
    content:
      "Cerramos el mes con un 15% de crecimiento en ventas. ¡Excelente trabajo de todos los departamentos! 📈💼 #Finanzas #Crecimiento",
    timestamp: "Hace 10 horas",
    likes: 32,
    comments: [
      {
        user: "Juan Pérez",
        content: "¡Fantásticas noticias! Sigamos así.",
        timestamp: "Hace 9 horas",
      },
      {
        user: "María González",
        content: "El esfuerzo de todos está dando frutos.",
        timestamp: "Hace 8 horas",
      },
    ],
    type: "achievement",
  },
];

export const departmentColors = {
  Transporte: "#00227D",
  Depósito: "#F01E23",
  RRHH: "#00227D",
  Automotores: "#F01E23",
  Finanzas: "#00227D",
};

export const trendingTopics = [
  { tag: "#Capacitacion", posts: 12 },
  { tag: "#Seguridad", posts: 8 },
  { tag: "#Record", posts: 5 },
  { tag: "#Equipo", posts: 15 },
  { tag: "#RRHH", posts: 7 },
];
