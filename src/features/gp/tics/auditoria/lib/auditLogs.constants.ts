import { type ModelComplete } from "@/core/core.interface";
import { AuditLogsResource } from "./auditLogs.interface";

const ROUTE = "auditoria";
const ABSOLUTE_ROUTE = "/gp/tics/auditoria";

export const AUDIT_LOGS: ModelComplete<AuditLogsResource> = {
  MODEL: {
    name: "Auditoría",
    plural: "Auditorías",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/audit-logs",
  QUERY_KEY: "auditLogs",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: {
    id: 0,
    user_id: null,
    user_name: null,
    user_email: null,
    auditable_type: "",
    auditable_id: 0,
    model_name: "",
    action: "",
    action_description: "",
    old_values: null,
    new_values: null,
    changed_fields: null,
    changes_summary: null,
    ip_address: null,
    user_agent: null,
    url: null,
    method: null,
    request_data: null,
    description: null,
    metadata: null,
    created_at: "",
  },
};
