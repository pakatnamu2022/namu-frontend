import { User, Target, Users, UserCheck } from "lucide-react";

/**
 * Tipos de evaluadores en el sistema de evaluación 360°
 */
export const EVALUATOR_TYPES = {
  JEFE: {
    id: 0,
    name: "Jefe Directo",
    shortName: "Jefe",
    description: "Como Líder",
    weight: "60%",
    icon: User,
    color: "default" as const,
  },
  AUTO: {
    id: 1,
    name: "Autoevaluación",
    shortName: "Auto",
    description: "Autoevaluaciones",
    weight: "20%",
    icon: Target,
    color: "secondary" as const,
  },
  PARES: {
    id: 2,
    name: "Pares",
    shortName: "Par",
    description: "Como Par",
    weight: "10%",
    icon: Users,
    color: "tertiary" as const,
  },
  REPORTES: {
    id: 3,
    name: "Reportes/Subordinados",
    shortName: "Reporte",
    description: "Como Reporte",
    weight: "10%",
    icon: UserCheck,
    color: "outline" as const,
  },
} as const;

/**
 * Array de tipos de evaluadores para iteración
 */
export const EVALUATOR_TYPES_ARRAY = [
  EVALUATOR_TYPES.JEFE,
  EVALUATOR_TYPES.AUTO,
  EVALUATOR_TYPES.PARES,
  EVALUATOR_TYPES.REPORTES,
];

/**
 * Obtener configuración de tipo de evaluador por ID
 */
export const getEvaluatorTypeById = (typeId: number) => {
  return EVALUATOR_TYPES_ARRAY.find((type) => type.id === typeId);
};

/**
 * Tipo especial para "Todos"
 */
export const ALL_EVALUATOR_TYPE = {
  id: null,
  name: "Todos",
  description: "Todas las evaluaciones",
} as const;
