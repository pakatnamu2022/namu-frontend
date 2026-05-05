import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
import type { AdoptionUser } from "../lib/adoption.interface";

interface Props {
  data: AdoptionUser[];
}

function scoreBadgeColor(score: number) {
  if (score >= 70) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 40) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-red-100 text-red-700 border-red-200";
}

function scoreBarColor(score: number) {
  if (score >= 70) return "bg-green-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function badgeVariantFor(badge: string | null) {
  if (!badge) return null;
  const map: Record<string, string> = {
    "Campeón del Sistema": "bg-violet-600 text-white",
    "Power User": "bg-blue-600 text-white",
    "Early Adopter": "bg-emerald-600 text-white",
  };
  return map[badge] ?? "bg-gray-500 text-white";
}

export default function AdoptionUsersRanking({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.adoption_score - a.adoption_score);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="size-4 text-blue-600" />
          Ranking de Usuarios — Adopción Operativa
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[420px]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">#</th>
                <th className="text-left px-4 py-2 font-semibold">Usuario</th>
                <th className="text-left px-4 py-2 font-semibold">Sede</th>
                <th className="text-right px-4 py-2 font-semibold">Ops</th>
                <th className="text-right px-4 py-2 font-semibold">Módulos</th>
                <th className="text-left px-4 py-2 font-semibold w-36">Score</th>
                <th className="text-left px-4 py-2 font-semibold">Badge</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    Sin datos
                  </td>
                </tr>
              ) : (
                sorted.map((user, idx) => {
                  const badgeCss = badgeVariantFor(user.badge);
                  return (
                    <tr
                      key={user.user_id}
                      className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-2 text-muted-foreground font-mono">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2 font-medium">{user.user_name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{user.sede_name}</td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {user.total_ops.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {user.unique_modules}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={user.adoption_score}
                            className="h-1.5 flex-1 bg-gray-200"
                            indicatorClassName={scoreBarColor(user.adoption_score)}
                          />
                          <span
                            className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${scoreBadgeColor(user.adoption_score)}`}
                          >
                            {user.adoption_score.toFixed(0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {badgeCss && user.badge ? (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeCss}`}
                          >
                            {user.badge}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
