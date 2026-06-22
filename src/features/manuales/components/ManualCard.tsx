import { BookOpen } from "lucide-react";
import { ManualResource } from "../lib/manuales.interface";

interface ManualCardProps {
  manual: ManualResource;
  onClick: (manual: ManualResource) => void;
}

export default function ManualCard({ manual, onClick }: ManualCardProps) {
  return (
    <button
      onClick={() => onClick(manual)}
      className="w-full text-left bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{manual.title}</p>
          {manual.description && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
              {manual.description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
