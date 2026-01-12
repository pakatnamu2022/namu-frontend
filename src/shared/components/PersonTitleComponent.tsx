import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import BackButton from "./BackButton";

interface Props {
  name: string;
  position: string;
  photo?: string;
  className?: string;
  children?: React.ReactNode;
  backButtonRoute?: string;
  backButtonName?: string;
}

export default function PersonTitleComponent({
  name,
  position,
  photo,
  className = "",
  children,
  backButtonRoute,
  backButtonName = "",
}: Props) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex flex-row gap-4 items-center md:items-center justify-between w-full md:w-full",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-row gap-4 items-center md:items-center w-full md:w-full",
          className
        )}
      >
        {backButtonRoute && (
          <BackButton
            route={backButtonRoute}
            name={backButtonName}
            size="icon"
          />
        )}
        <Avatar className="h-12 w-12 rounded-lg">
          <AvatarImage src={photo} alt={name} className="rounded-lg" />
          <AvatarFallback className="bg-primary rounded-lg text-white text-sm md:text-base">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <h1 className="md:text-xl font-bold text-primary uppercase">
            {name}
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm uppercase">
            {position}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
