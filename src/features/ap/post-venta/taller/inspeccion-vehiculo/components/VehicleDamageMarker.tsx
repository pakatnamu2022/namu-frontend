import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DAMAGE_TYPES,
  DAMAGE_SYMBOLS,
  DAMAGE_COLORS,
  DamageType,
} from "../lib/vehicleInspection.interface";
import { VehicleInspectionDamageSchema } from "../lib/vehicleInspection.schema";
import { X, Upload, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VehicleDamageMarkerProps {
  damages: VehicleInspectionDamageSchema[];
  onChange: (damages: VehicleInspectionDamageSchema[]) => void;
  disabled?: boolean;
}

export default function VehicleDamageMarker({
  damages,
  onChange,
  disabled = false,
}: VehicleDamageMarkerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDamage, setSelectedDamage] =
    useState<VehicleInspectionDamageSchema | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const imageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setSelectedDamage({
      damage_type: DAMAGE_TYPES.PAINT_DAMAGE,
      x_coordinate: x,
      y_coordinate: y,
      description: "",
      photo_url: "",
    });
    setPreviewUrl("");
    setIsDialogOpen(true);
  };

  const handleSaveDamage = () => {
    if (selectedDamage) {
      onChange([...damages, selectedDamage]);
      setIsDialogOpen(false);
      setSelectedDamage(null);
      setPreviewUrl("");
    }
  };

  const handleDeleteDamage = (index: number) => {
    const newDamages = damages.filter((_, i) => i !== index);
    onChange(newDamages);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedDamage) {
      // Crear previsualización local inmediatamente
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      // Guardar el archivo en el estado del daño para enviarlo al final
      setSelectedDamage({
        ...selectedDamage,
        photo_url: localPreviewUrl,
        photo_file: file,
      });
    }
  };

  const getDamageSymbol = (damageType: string) => {
    return DAMAGE_SYMBOLS[damageType as DamageType] || "?";
  };

  const getDamageColor = (damageType: string) => {
    return DAMAGE_COLORS[damageType as DamageType] || "#000000";
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">
            Marcador de Daños del Vehículo
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Haz clic en la imagen del vehículo para marcar la ubicación de los
            daños
          </p>

          {/* Leyenda de símbolos */}
          <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            {Object.entries(DAMAGE_TYPES).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="font-bold text-lg"
                  style={{ color: getDamageColor(value) }}
                >
                  {getDamageSymbol(value)}
                </span>
                <span className="text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Imagen del vehículo con marcadores */}
        <div
          ref={imageRef}
          className="relative w-full bg-gray-100 rounded-lg overflow-hidden cursor-crosshair"
          style={{
            minHeight: "500px",
            backgroundImage: 'url("/images/body_car.png")',
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          onClick={handleImageClick}
        >
          {/* Marcadores de daños */}
          {damages.map((damage, index) => (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${damage.x_coordinate}%`,
                top: `${damage.y_coordinate}%`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white"
                style={{ backgroundColor: getDamageColor(damage.damage_type) }}
              >
                {getDamageSymbol(damage.damage_type)}
              </div>

              {/* Tooltip con información del daño */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap shadow-lg">
                  {damage.description && (
                    <p className="text-gray-300">{damage.description}</p>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="mt-2 h-6 text-xs"
                    onClick={() => handleDeleteDamage(index)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Lista de daños registrados */}
      {damages.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Daños Registrados</h4>
          <div className="space-y-2">
            {damages.map((damage, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-bold text-lg"
                      style={{ color: getDamageColor(damage.damage_type) }}
                    >
                      {getDamageSymbol(damage.damage_type)}
                    </span>
                    <Badge
                      style={{
                        backgroundColor: getDamageColor(damage.damage_type),
                      }}
                    >
                      {damage.damage_type}
                    </Badge>
                  </div>
                  {damage.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {damage.description}
                    </p>
                  )}
                  {damage.photo_url && (
                    <img
                      src={damage.photo_url}
                      alt="Daño"
                      className="mt-2 w-24 h-24 object-cover rounded"
                    />
                  )}
                </div>
                {!disabled && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteDamage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dialog para agregar daño */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Daño</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="damage_type">Tipo de Daño</Label>
              <Select
                value={selectedDamage?.damage_type || ""}
                onValueChange={(value) =>
                  setSelectedDamage(
                    selectedDamage
                      ? { ...selectedDamage, damage_type: value }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo de daño" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DAMAGE_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      <span className="flex items-center gap-2">
                        <span
                          className="font-bold"
                          style={{ color: getDamageColor(value) }}
                        >
                          {getDamageSymbol(value)}
                        </span>
                        {value}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción detallada del daño"
                rows={3}
                value={selectedDamage?.description || ""}
                onChange={(e) =>
                  setSelectedDamage(
                    selectedDamage
                      ? { ...selectedDamage, description: e.target.value }
                      : null
                  )
                }
              />
            </div>

            <div>
              <Label>Foto del Daño</Label>
              <div className="mt-2">
                {selectedDamage?.photo_url || previewUrl ? (
                  <div className="relative">
                    <img
                      src={selectedDamage?.photo_url || previewUrl}
                      alt="Daño"
                      className="w-full h-40 object-cover rounded border-2 border-gray-200"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        if (selectedDamage) {
                          setSelectedDamage({
                            ...selectedDamage,
                            photo_url: "",
                            photo_file: undefined,
                          });
                        }
                        setPreviewUrl("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Foto
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedDamage(null);
                setPreviewUrl("");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveDamage}>Guardar Daño</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
