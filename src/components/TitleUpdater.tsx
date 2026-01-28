import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function formatPathToTitle(pathname: string): string {
  if (pathname === "/") return "Inicio";

  // Toma el último segmento de la ruta y lo formatea
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  // Si es un ID (UUID o número), usa el penúltimo segmento
  const isId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      lastSegment
    ) || /^\d+$/.test(lastSegment);

  const segmentToFormat = isId
    ? segments[segments.length - 2] || lastSegment
    : lastSegment;

  // Convierte "evaluaciones-de-desempeno" a "Evaluaciones De Desempeño"
  return segmentToFormat
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/Desempeno/gi, "Desempeño")
    .replace(/Vehiculo/gi, "Vehículo")
    .replace(/Vehiculos/gi, "Vehículos")
    .replace(/Numero/gi, "Número")
    .replace(/Telefono/gi, "Teléfono");
}

export function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    const title = formatPathToTitle(location.pathname);
    document.title = `${title} | Sian`;
  }, [location.pathname]);

  return null;
}
