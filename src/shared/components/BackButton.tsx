import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const BackButton = ({
  route = "",
  name = "",
  fullname = true,
  variant = "outline",
  size = "sm",
  onClick,
}: {
  route?: string;
  name: string;
  fullname?: boolean;
  size?: "sm" | "lg" | "icon" | "default";
  variant?: "outline" | "default" | "ghost" | "link" | "destructive";
  onClick?: () => void;
}) => {
  const label =
    size !== "icon" ? (fullname ? "Regresar a " + name : "Regresar") : null;

  const inner = (
    <Button variant={variant} size={size} onClick={onClick}>
      <ChevronLeft className="w-4 h-4" />
      {label}
    </Button>
  );

  return (
    <div className="lg:col-span-1 space-y-6">
      {onClick ? (
        inner
      ) : (
        <Link to={route} className="w-full flex justify-center items-center gap-2">
          {inner}
        </Link>
      )}
    </div>
  );
};

export default BackButton;
