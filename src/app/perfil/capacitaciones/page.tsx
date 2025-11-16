import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

const training = [
  {
    title: "Seguridad Industrial",
    status: "completed",
    date: "2024-01-15",
    progress: 100,
  },
  {
    title: "Gestión de Calidad",
    status: "in-progress",
    date: "2024-02-01",
    progress: 75,
  },
  {
    title: "Liderazgo Empresarial",
    status: "pending",
    date: "2024-03-01",
    progress: 0,
  },
  {
    title: "Sistemas de Gestión",
    status: "completed",
    date: "2023-12-10",
    progress: 100,
  },
];

export default function TrainingPage() {
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-primary">Capacitaciones</h3>
        <Badge className="bg-secondary text-white">
          {training.filter((t) => t.status === "completed").length} Completadas
        </Badge>
      </div>
      <div className="grid gap-4">
        {training.map((training, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      training.status === "completed"
                        ? "bg-green-100"
                        : training.status === "in-progress"
                        ? "bg-yellow-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {training.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : training.status === "in-progress" ? (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">
                      {training.title}
                    </h4>
                    <p className="text-sm text-gray-500">{training.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{training.progress}%</p>
                  <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-full bg-secondary rounded-full transition-all duration-300"
                      style={{ width: `${training.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
