import { useAuthStore } from "@/features/auth/lib/auth.store";

export interface PermissionAction {
  value: string; // API value
  label: string; // Frontend display label
  icon?: string; // Optional icon name for UI
  description?: string; // Optional description
}

export const PERMISSION_ACTIONS: PermissionAction[] = [
  {
    value: "view",
    label: "Ver",
    icon: "Eye",
    description: "Permite visualizar información",
  },
  {
    value: "create",
    label: "Crear",
    icon: "Plus",
    description: "Permite crear nuevos registros",
  },
  {
    value: "update",
    label: "Editar",
    icon: "Pencil",
    description: "Permite modificar registros existentes",
  },
  {
    value: "delete",
    label: "Eliminar",
    icon: "Trash2",
    description: "Permite eliminar o anular registros",
  },
  {
    value: "export",
    label: "Exportar",
    icon: "Download",
    description: "Permite exportar datos",
  },
  {
    value: "import",
    label: "Importar",
    icon: "Upload",
    description: "Permite importar datos",
  },
  {
    value: "authorize",
    label: "Autorizar",
    icon: "CheckCircle",
    description: "Permite autorizar solicitudes o acciones",
  },
  {
    value: "approve",
    label: "Aprobar",
    icon: "ThumbsUp",
    description: "Permite aprobar documentos o procesos",
  },
  {
    value: "reject",
    label: "Rechazar",
    icon: "ThumbsDown",
    description: "Permite rechazar solicitudes",
  },
  {
    value: "annul",
    label: "Anular",
    icon: "XCircle",
    description: "Permite anular registros o documentos",
  },
  {
    value: "print",
    label: "Imprimir",
    icon: "Printer",
    description: "Permite imprimir documentos",
  },
  {
    value: "send",
    label: "Enviar",
    icon: "Send",
    description: "Permite enviar información",
  },
  {
    value: "duplicate",
    label: "Duplicar",
    icon: "Copy",
    description: "Permite duplicar registros",
  },
  {
    value: "viewAdvisors",
    label: "Ver Asesores",
    icon: "Users",
    description: "Permite ver información de asesores asignados",
  },
  {
    value: "viewBranches",
    label: "Ver Por Sedes",
    icon: "Building",
    description: "Permite ver información por sedes",
  },
  {
    value: "assign",
    label: "Asignar",
    icon: "Link",
    description: "Permite asignar vehículos a solicitudes",
  },
];

/**
 * Hook to check permissions for a specific module
 * @param moduleCode - The module code (e.g., "solicitudes-y-cotizaciones")
 * @returns Object with permission checking methods
 *
 * @example
 * const { canCreate, canUpdate, canDelete, hasPermission } = useModulePermissions("solicitudes-y-cotizaciones");
 *
 * if (canCreate) {
 *   Show create button
 * }
 *
 * Or check custom permissions
 * const canApprove = hasPermission("approve");
 */
export function useModulePermissions(moduleCode: string) {
  const { hasPermission } = useAuthStore();

  /**
   * Check if user has a specific permission for this module
   * @param action - The action code (e.g., "create", "update", "approve")
   */
  const hasModulePermission = (action: string): boolean => {
    return hasPermission(`${moduleCode}.${action}`);
  };

  return {
    // Generic permission checker
    hasPermission: hasModulePermission,
    canView: hasModulePermission("view"),
    canCreate: hasModulePermission("create"),
    canUpdate: hasModulePermission("update"),
    canDelete: hasModulePermission("delete"),
    canExport: hasModulePermission("export"),
    canImport: hasModulePermission("import"),
    canApprove: hasModulePermission("approve"),
    canReject: hasModulePermission("reject"),
    canAnnul: hasModulePermission("annul"),
    canAuthorize: hasModulePermission("authorize"),
    canPrint: hasModulePermission("print"),
    canSend: hasModulePermission("send"),
    canDuplicate: hasModulePermission("duplicate"),
    canViewAdvisors: hasModulePermission("viewAdvisors"),
    canViewBranches: hasModulePermission("viewBranches"),
    canAssign: hasModulePermission("assign"),
  };
}
