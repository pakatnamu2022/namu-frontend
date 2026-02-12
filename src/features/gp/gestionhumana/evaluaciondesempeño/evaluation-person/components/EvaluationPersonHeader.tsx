import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardTitle, CardDescription } from "@/components/ui/card";

interface EvaluationPersonHeaderProps {
  personName: string;
  personPosition: string;
  personPhoto?: string;
  completionRate: number;
}

export default function EvaluationPersonHeader({
  personName,
  personPosition,
  personPhoto,
  completionRate,
}: EvaluationPersonHeaderProps) {
  const initials = personName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={personPhoto} alt={personName} />
        <AvatarFallback className="bg-primary text-white text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <CardTitle className="text-2xl capitalize">
          {personName.toLowerCase()}
        </CardTitle>
        <CardDescription className="capitalize text-base">
          {personPosition.toLowerCase()}
        </CardDescription>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-primary">
          {completionRate}%
        </div>
        <div className="text-xs text-muted-foreground">
          Progreso general
        </div>
      </div>
    </div>
  );
}
