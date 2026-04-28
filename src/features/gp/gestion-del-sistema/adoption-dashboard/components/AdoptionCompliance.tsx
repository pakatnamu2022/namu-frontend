import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import type { AdoptionCompliance as AdoptionComplianceType } from "../lib/adoption.interface";

interface Props {
  data: AdoptionComplianceType;
}

const semaphoreBar: Record<string, string> = {
  green: "bg-green-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
};

const semaphoreText: Record<string, string> = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

const semaphoreLabel: Record<string, string> = {
  green: "Óptimo",
  yellow: "En seguimiento",
  red: "Crítico",
};

export default function AdoptionCompliance({ data }: Props) {
  const { active_compliance, inactive_users, summary } = data;
  const allUsers = [...active_compliance, ...inactive_users];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckCircle2 className="size-4 text-emerald-600" />
          Cumplimiento Esperado vs Real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Semaphore summary pills */}
        <div className="flex flex-wrap gap-3">
          {(["green", "yellow", "red"] as const).map((color) => (
            <div
              key={color}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${semaphoreText[color]}`}
            >
              <span className={`size-2.5 rounded-full inline-block ${semaphoreBar[color]}`} />
              {semaphoreLabel[color]}
              <span className="font-bold tabular-nums">{summary[color]}</span>
            </div>
          ))}
          {inactive_users.length > 0 && (
            <div className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold bg-gray-100 text-gray-600">
              <span className="size-2.5 rounded-full inline-block bg-gray-400" />
              Inactivos
              <span className="font-bold tabular-nums">{inactive_users.length}</span>
            </div>
          )}
        </div>

        {/* Per-user compliance list */}
        {allUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sin datos de cumplimiento en el período
          </p>
        ) : (
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {allUsers.map((user, i) => {
              const bar = semaphoreBar[user.semaphore] ?? semaphoreBar.yellow;
              const badge = semaphoreText[user.semaphore] ?? semaphoreText.yellow;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm border rounded-lg px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block">{user.user_name}</span>
                    <span className="text-xs text-muted-foreground">{user.sede_name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
                      {user.actual_ops.toLocaleString()} / {Math.round(user.expected_ops).toLocaleString()} ops
                    </span>
                    <Progress
                      value={user.compliance_pct}
                      className="h-1.5 w-24 bg-gray-200"
                      indicatorClassName={bar}
                    />
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${badge}`}>
                      {user.compliance_pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
