import { Badge } from "@/components/ui/badge";

interface CompanyStatusBadgesProps {
  status: string;
  condition: string;
  show?: boolean;
}

export const CompanyStatusBadges = ({
  status,
  condition,
  show = true,
}: CompanyStatusBadgesProps) => {
  if (!show || (status === "-" && condition === "-")) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {/* Estado */}
      {status !== "-" && (
        <Badge
          variant={status === "ACTIVO" ? "green" : "red"}
          size="xs"
          className="rounded-sm py-0 md:px-2"
        >
          <div
            className={`w-2 h-2 mr-1 rounded-full ${
              status === "ACTIVO" ? "bg-green-500" : "bg-red-500"
            }`}
          />
          Estado: {status}
        </Badge>
      )}

      {/* Condición */}
      {condition !== "-" && (
        <Badge
          variant={status === "ACTIVO" ? "green" : "red"}
          size="xs"
          className="rounded-sm py-0 md:px-2"
        >
          <div
            className={`w-2 h-2 mr-1 rounded-full ${
              status === "ACTIVO" ? "bg-green-500" : "bg-red-500"
            }`}
          />
          Condición: {condition}
        </Badge>
      )}
    </div>
  );
};
