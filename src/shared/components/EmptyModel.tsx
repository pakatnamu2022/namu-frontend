import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import * as LucideReact from "lucide-react";
import { useCurrentModule } from "../hooks/useCurrentModule";
import { useRouter } from "next/navigation";

interface Props {
  route: string;
}

export default function EmptyModel({ route }: Props) {
  const { push } = useRouter();
  const { currentView } = useCurrentModule();

  const title = currentView?.descripcion || "Sin datos";
  const description = "No existen datos para mostrar en este momento.";
  const Icon = currentView?.icon
    ? (LucideReact[currentView.icon] as React.ComponentType<any>)
    : null;

  return (
    <Empty className="from-muted/50 to-background h-full bg-gradient-to-b from-30%">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {Icon && <Icon className="size-16 text-muted-foreground" />}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" size="sm" onClick={() => push(route)}>
          <LucideReact.ArrowLeftIcon />
          Regresar
        </Button>
      </EmptyContent>
    </Empty>
  );
}
