import { ChevronRight, FileText } from "lucide-react";
import { ManualResource } from "../lib/manuales.interface";
import { Button } from "@/components/ui/button";

interface ManualCardProps {
  manual: ManualResource;
  onClick: (manual: ManualResource) => void;
}

export default function ManualCard({ manual, onClick }: ManualCardProps) {
  return (
    <Button
      variant="ghost"
      className="flex flex-col h-auto w-full p-0 rounded-2xl shadow-sm overflow-hidden text-left"
      onClick={() => onClick(manual)}
    >
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 w-full">
        <div className="shrink-0 w-11 h-11 rounded-xl bg-linear-to-br from-primary/15 to-primary/5 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 leading-snug line-clamp-2">
            {manual.title}
          </p>
        </div>
      </div>

      {manual.description && (
        <p className="px-5 pb-4 w-full text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {manual.description}
        </p>
      )}

      <div className="flex items-center justify-between px-5 py-3 w-full bg-gray-50 rounded-b-2xl">
        <span className="text-xs font-medium text-primary">Ver manual</span>
        <ChevronRight className="w-4 h-4 text-primary transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </Button>
  );
}
