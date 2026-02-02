import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CHECKLIST_ITEMS } from "../lib/vehicleInspection.constants";
import { FileText, PackageCheck, Wrench, AlertCircle } from "lucide-react";

interface VehicleInspectionChecklistProps {
  values: Record<string, boolean>;
  onChange: (key: string, value: boolean) => void;
  disabled?: boolean;
}

export default function VehicleInspectionChecklist({
  values,
  onChange,
  disabled = false,
}: VehicleInspectionChecklistProps) {
  const categories = {
    estado: {
      title: "Estado del Vehículo",
      icon: AlertCircle,
      color: "text-gray-700",
      bgColor: "bg-gray-50",
    },
    documentos: {
      title: "Documentos",
      icon: FileText,
      color: "text-gray-700",
      bgColor: "bg-gray-50",
    },
    accesorios: {
      title: "Accesorios",
      icon: PackageCheck,
      color: "text-gray-700",
      bgColor: "bg-gray-50",
    },
    herramientas: {
      title: "Herramientas",
      icon: Wrench,
      color: "text-gray-700",
      bgColor: "bg-gray-50",
    },
  };

  const groupedItems = CHECKLIST_ITEMS.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, Array<(typeof CHECKLIST_ITEMS)[number]>>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(groupedItems).map(([category, items]) => {
        const categoryInfo = categories[category as keyof typeof categories];
        const Icon = categoryInfo.icon;

        return (
          <Card
            key={category}
            className={`p-4 ${categoryInfo.bgColor} border-2`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Icon className={`h-5 w-5 ${categoryInfo.color}`} />
              <h3 className={`font-semibold ${categoryInfo.color}`}>
                {categoryInfo.title}
              </h3>
            </div>

            <div className="space-y-2 md:space-y-3">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center space-x-3 md:space-x-2 p-2 md:p-0 rounded-lg hover:bg-gray-100 md:hover:bg-transparent transition-colors"
                >
                  <Checkbox
                    id={item.key}
                    checked={values[item.key] || false}
                    onCheckedChange={(checked) =>
                      onChange(item.key, checked as boolean)
                    }
                    disabled={disabled}
                    className="h-6 w-6 md:h-4 md:w-4"
                  />
                  <Label
                    htmlFor={item.key}
                    className="text-base md:text-sm font-normal cursor-pointer flex-1"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
