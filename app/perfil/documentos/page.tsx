import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Eye, FileText } from "lucide-react";

const documents = [
  {
    name: "Contrato de Trabajo",
    type: "PDF",
    size: "2.3 MB",
    date: "2020-03-15",
  },
  {
    name: "Certificado de Capacitación",
    type: "PDF",
    size: "1.1 MB",
    date: "2024-01-15",
  },
  {
    name: "Evaluación de Desempeño",
    type: "PDF",
    size: "890 KB",
    date: "2023-12-20",
  },
  {
    name: "Manual del Empleado",
    type: "PDF",
    size: "5.2 MB",
    date: "2024-01-01",
  },
];

export default function DocumentPage() {
  return (
    <div className="space-y-4 w-full">
      <h3 className="text-xl font-bold text-primary">Documentación</h3>
      <div className="grid gap-3">
        {documents.map((doc, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">{doc.name}</h4>
                    <p className="text-sm text-gray-500">
                      {doc.type} • {doc.size} • {doc.date}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
