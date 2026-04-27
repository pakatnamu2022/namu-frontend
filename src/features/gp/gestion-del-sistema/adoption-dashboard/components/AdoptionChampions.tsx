import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, AlertTriangle } from "lucide-react";
import type { AdoptionChampions as AdoptionChampionsType } from "../lib/adoption.interface";

interface Props {
  data: AdoptionChampionsType;
}

const badgeStyles: Record<string, { bg: string; text: string; icon: string }> = {
  "Campeón del Sistema": { bg: "bg-violet-600", text: "text-white", icon: "🏆" },
  "Power User": { bg: "bg-blue-600", text: "text-white", icon: "⚡" },
  "Early Adopter": { bg: "bg-emerald-600", text: "text-white", icon: "🌱" },
};

const riskStyles: Record<string, { border: string; bg: string; badge: string; label: string }> = {
  alto: { border: "border-red-200", bg: "bg-red-50", badge: "bg-red-100 text-red-700", label: "Riesgo Alto" },
  medio: { border: "border-amber-200", bg: "bg-amber-50", badge: "bg-amber-100 text-amber-700", label: "Riesgo Medio" },
  bajo: { border: "border-yellow-200", bg: "bg-yellow-50", badge: "bg-yellow-100 text-yellow-700", label: "Riesgo Bajo" },
};

export default function AdoptionChampions({ data }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Champions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4 text-amber-500" />
            Usuarios Campeones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.champions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Sin campeones en el período
            </p>
          ) : (
            data.champions.map((champion, idx) => {
              const bStyle = champion.badge
                ? badgeStyles[champion.badge] ?? { bg: "bg-gray-600", text: "text-white", icon: "★" }
                : null;
              return (
                <div
                  key={champion.user_id}
                  className="flex items-center gap-3 rounded-xl border p-3 bg-linear-to-r from-violet-50/60 to-background dark:from-violet-950/20"
                >
                  <div className="flex items-center justify-center size-8 rounded-full bg-violet-100 text-violet-700 font-bold text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm truncate">{champion.user_name}</span>
                      {bStyle && champion.badge && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bStyle.bg} ${bStyle.text}`}>
                          {bStyle.icon} {champion.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{champion.sede_name}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress
                        value={champion.adoption_score}
                        className="h-1.5 flex-1 bg-gray-200"
                        indicatorClassName="bg-violet-500"
                      />
                      <span className="text-xs font-bold text-violet-700 shrink-0">
                        {champion.adoption_score.toFixed(0)} pts
                      </span>
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{champion.unique_modules} módulos</span>
                      <span>•</span>
                      <span>{champion.active_days} días activo</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* At-Risk Users */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="size-4 text-red-500" />
            Usuarios en Riesgo de No Adopción
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[420px] overflow-y-auto">
          {data.at_risk.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Sin usuarios en riesgo en el período
            </p>
          ) : (
            data.at_risk.map((user) => {
              const rStyle = riskStyles[user.risk_level] ?? riskStyles.bajo;
              return (
                <div
                  key={user.user_id}
                  className={`rounded-lg border p-3 ${rStyle.border} ${rStyle.bg}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-semibold text-sm">{user.user_name}</span>
                      <p className="text-xs text-muted-foreground">{user.sede_name}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${rStyle.badge}`}>
                      {rStyle.label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress
                      value={user.adoption_score}
                      className="h-1.5 flex-1 bg-gray-200"
                      indicatorClassName={
                        user.risk_level === "alto" ? "bg-red-500" :
                        user.risk_level === "medio" ? "bg-amber-500" : "bg-yellow-400"
                      }
                    />
                    <span className="text-xs font-bold tabular-nums shrink-0">
                      {user.adoption_score.toFixed(0)} pts
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{user.total_ops} operaciones</span>
                    <span>•</span>
                    <span>{user.active_days} día{user.active_days !== 1 ? "s" : ""} activo</span>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
