import { ModelComplete } from "@/src/core/core.interface";
import { AuditLogsResource } from "./auditLogs.interface";

const ROUTE = "auditoria";

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
