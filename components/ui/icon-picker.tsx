"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Exportaciones que no son componentes de iconos
const EXCLUDED_EXPORTS = [
  "createLucideIcon",
  "Icon",
  "default",
  "icons",
  "dynamicIconImports",
];

// Categorías de iconos de Lucide
const ICON_CATEGORIES: Record<string, string[]> = {
  Todos: [], // Se llenará con todos los iconos
  Popular: [
    "Star",
    "Heart",
    "Shield",
    "Zap",
    "Award",
    "CheckCircle",
    "Users",
    "Settings",
    "Search",
    "Home",
    "Mail",
    "Phone",
    "Bell",
    "Calendar",
    "Clock",
    "Download",
    "Upload",
    "Send",
    "Share",
    "Bookmark",
    "Tag",
  ],
  Flechas: [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUpRight",
    "ArrowDownRight",
    "ArrowUpLeft",
    "ArrowDownLeft",
    "ChevronUp",
    "ChevronDown",
    "ChevronLeft",
    "ChevronRight",
    "ChevronsUp",
    "ChevronsDown",
    "ChevronsLeft",
    "ChevronsRight",
    "MoveUp",
    "MoveDown",
    "MoveLeft",
    "MoveRight",
    "TrendingUp",
    "TrendingDown",
  ],
  Comunicación: [
    "Mail",
    "MessageCircle",
    "MessageSquare",
    "Phone",
    "PhoneCall",
    "PhoneIncoming",
    "PhoneOutgoing",
    "Send",
    "AtSign",
    "Mic",
    "Video",
    "Voicemail",
    "Inbox",
    "Wifi",
    "WifiOff",
  ],
  Archivos: [
    "File",
    "FileText",
    "Folder",
    "FolderOpen",
    "Archive",
    "Download",
    "Upload",
    "Copy",
    "Clipboard",
    "Save",
    "FileEdit",
    "FilePlus",
    "FileMinus",
    "FileCheck",
    "FileX",
    "Files",
    "FolderPlus",
  ],
  Multimedia: [
    "Image",
    "Video",
    "Music",
    "Camera",
    "Film",
    "Play",
    "Pause",
    "StopCircle",
    "SkipForward",
    "SkipBack",
    "Volume",
    "Volume1",
    "Volume2",
    "VolumeX",
    "Mic",
    "MicOff",
  ],
  Diseño: [
    "Layout",
    "Sidebar",
    "PanelLeft",
    "PanelRight",
    "Columns",
    "Grid",
    "Layers",
    "Square",
    "Circle",
    "Triangle",
    "Palette",
    "Pen",
    "Brush",
    "Pipette",
    "Shapes",
    "Box",
  ],
  Dispositivos: [
    "Monitor",
    "Smartphone",
    "Tablet",
    "Laptop",
    "Watch",
    "Tv",
    "Printer",
    "Camera",
    "Gamepad",
    "Cpu",
    "HardDrive",
    "Battery",
    "BatteryCharging",
    "Usb",
    "Keyboard",
  ],
  Desarrollo: [
    "Code",
    "Terminal",
    "FileCode",
    "Braces",
    "Bug",
    "GitBranch",
    "GitCommit",
    "GitMerge",
    "GitPullRequest",
    "Github",
    "Database",
    "Server",
    "Cloud",
    "Package",
    "Box",
  ],
  Negocios: [
    "Briefcase",
    "Building",
    "ShoppingCart",
    "CreditCard",
    "DollarSign",
    "TrendingUp",
    "BarChart",
    "PieChart",
    "Target",
    "Rocket",
    "Globe",
    "MapPin",
    "Navigation",
    "Compass",
  ],
  Social: [
    "Share",
    "ThumbsUp",
    "ThumbsDown",
    "Heart",
    "MessageCircle",
    "Send",
    "UserPlus",
    "Users",
    "AtSign",
    "Hash",
    "Link",
    "Eye",
    "EyeOff",
  ],
  Interfaz: [
    "Menu",
    "X",
    "Plus",
    "Minus",
    "Check",
    "ChevronRight",
    "ChevronLeft",
    "Settings",
    "MoreVertical",
    "MoreHorizontal",
    "Filter",
    "Search",
    "Bell",
    "Info",
    "HelpCircle",
    "AlertCircle",
    "XCircle",
    "CheckCircle",
  ],
  Clima: [
    "Sun",
    "Moon",
    "Cloud",
    "CloudRain",
    "CloudSnow",
    "Wind",
    "Droplet",
    "Flame",
    "Snowflake",
    "Umbrella",
    "Sunrise",
    "Sunset",
    "CloudDrizzle",
    "CloudLightning",
  ],
};

const getAllLucideIcons = (): string[] => {
  return Object.keys(LucideIcons)
    .filter((key) => !EXCLUDED_EXPORTS.includes(key))
    .sort();
};

// Llenar la categoría "Todos" con todos los iconos disponibles
ICON_CATEGORIES.Todos = getAllLucideIcons();

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Popular");
  const [isReady, setIsReady] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LucideIconsMap = LucideIcons as any;

  const allIcons = useMemo(() => getAllLucideIcons(), []);

  // Filtrar iconos según categoría y búsqueda
  const filteredIcons = useMemo(() => {
    if (searchQuery) {
      // Si hay búsqueda, buscar en todos los iconos
      return allIcons.filter((iconName: string) =>
        iconName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Retornar iconos de la categoría seleccionada
    return ICON_CATEGORIES[selectedCategory] || [];
  }, [selectedCategory, searchQuery, allIcons]);

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearchQuery("");
    setSelectedCategory("Popular");
  };

  // Virtualización - organizar iconos en filas de 6 columnas
  const COLUMNS = 6;
  const rowCount = Math.ceil(filteredIcons.length / COLUMNS);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 90, // Altura estimada de cada fila
    overscan: 5, // Renderizar 5 filas extra para suavizar el scroll
  });

  // Esperar a que el DOM esté listo antes de inicializar el virtualizer
  useEffect(() => {
    if (open) {
      setIsReady(false);
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
    }
  }, [open]);

  const CurrentIcon =
    value && LucideIconsMap[value]
      ? LucideIconsMap[value]
      : LucideIcons.ImageIcon;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2"
        >
          {CurrentIcon && <CurrentIcon className="h-4 w-4" />}
          <span>{value || "Seleccionar icono"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Seleccionar Icono</DialogTitle>
          <DialogDescription>
            Selecciona un icono de la lista o busca por nombre
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Barra de búsqueda y filtro de categoría */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar icono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            {!searchQuery && (
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(ICON_CATEGORIES).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Contador de resultados */}
          {searchQuery && (
            <p className="text-xs text-muted-foreground">
              Mostrando {filteredIcons.length} resultado
              {filteredIcons.length !== 1 ? "s" : ""}
            </p>
          )}

          {/* Grid virtualizado de iconos */}
          <div
            ref={parentRef}
            className="h-[400px] w-full rounded-md border overflow-auto"
            style={{ contain: "strict" }}
          >
            {isReady && (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const startIdx = virtualRow.index * COLUMNS;
                  const rowIcons = filteredIcons.slice(
                    startIdx,
                    startIdx + COLUMNS
                  );

                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <div className="grid grid-cols-6 gap-2 p-2">
                        {rowIcons.map((iconName) => {
                          const IconComponent = LucideIconsMap[iconName];
                          if (!IconComponent) return null;

                          return (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => handleIconSelect(iconName)}
                              className={`flex flex-col items-center justify-center p-3 rounded-md border hover:bg-accent hover:border-primary transition-colors ${
                                value === iconName
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background"
                              }`}
                              title={iconName}
                            >
                              <IconComponent className="h-6 w-6 mb-1" />
                              <span className="text-[10px] text-center break-all line-clamp-2">
                                {iconName}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mensaje cuando no hay resultados */}
            {filteredIcons.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <LucideIcons.Search className="h-8 w-8 mb-2" />
                <p className="text-sm">No se encontraron iconos</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <LucideIcons.Info className="h-4 w-4" />
              <span>
                {searchQuery ? (
                  <>
                    Mostrando{" "}
                    <strong className="text-foreground">
                      {filteredIcons.length}
                    </strong>{" "}
                    de{" "}
                    <strong className="text-foreground">
                      {allIcons.length}
                    </strong>{" "}
                    iconos
                  </>
                ) : (
                  <>
                    {selectedCategory}:{" "}
                    <strong className="text-foreground">
                      {filteredIcons.length}
                    </strong>{" "}
                    iconos
                    {" · "}Total:{" "}
                    <strong className="text-foreground">
                      {allIcons.length}
                    </strong>
                  </>
                )}
              </span>
            </div>
            <a
              href="https://lucide.dev/icons"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              Ver todos en lucide.dev
              <LucideIcons.ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
