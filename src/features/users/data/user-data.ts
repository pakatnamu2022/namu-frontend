export const userData = {
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
  permissions: {
    companies: ["transporte", "deposito", "grupo", "automotores"],
    modules: {
      transporte: ["facturacion", "rutas", "vehiculos", "conductores"],
      deposito: ["inventario", "recepcion", "despacho", "stock"],
      grupo: ["inventario", "finanzas", "rrhh", "reportes"],
      automotores: ["ventas", "servicio", "repuestos", "clientes"],
    },
    role: "admin",
  },
  stats: {
    pendingTasks: 3,
    completedTraining: 4,
    upcomingVacation: "15 Jul",
    notifications: 5,
    totalDocuments: 12,
    completedOnboarding: 80,
  },
}

export const limitedUserData = {
  personal: {
    name: "María González",
    email: "maria.gonzalez@empresa.com",
    phone: "+54 11 9876-5432",
    position: "Operadora de Transporte",
    department: "Transporte",
    location: "Buenos Aires, Argentina",
    startDate: "10 de Agosto, 2023",
    employeeId: "EMP-045",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  permissions: {
    companies: ["transporte"],
    modules: {
      transporte: ["rutas", "vehiculos"],
    },
    role: "operator",
  },
  stats: {
    pendingTasks: 1,
    completedTraining: 2,
    upcomingVacation: "No programadas",
    notifications: 2,
    totalDocuments: 5,
    completedOnboarding: 100,
  },
}
