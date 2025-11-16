import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export default function PostFilters({ activeFilter, setActiveFilter }: Props) {
  return (
    <Tabs value={activeFilter} onValueChange={setActiveFilter}>
      <TabsList className="grid w-full grid-cols-5 bg-background/80 border border-primary/10">
        <TabsTrigger
          value="all"
          className="data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          Todos
        </TabsTrigger>
        <TabsTrigger
          value="training"
          className="data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          Capacitación
        </TabsTrigger>
        <TabsTrigger
          value="achievement"
          className="data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          Logros
        </TabsTrigger>
        <TabsTrigger
          value="announcement"
          className="data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          Anuncios
        </TabsTrigger>
        <TabsTrigger
          value="work"
          className="data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          Trabajo
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
