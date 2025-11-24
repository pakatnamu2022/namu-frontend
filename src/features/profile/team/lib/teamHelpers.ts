import type { EvaluationPersonResultResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.interface";

/**
 * Filtra las evaluaciones por tipo de evaluador
 * @param data Array de personas a evaluar
 * @param evaluatorType Tipo de evaluador (0=Jefe, 1=Auto, 2=Pares, 3=Reportes, null=Todos)
 * @param userId ID del usuario logueado (partner_id)
 * @returns Array filtrado de personas donde el usuario tiene el rol especificado
 */
export const filterByEvaluatorType = (
  data: EvaluationPersonResultResource[],
  evaluatorType: number | null,
  userId: number | undefined
): EvaluationPersonResultResource[] => {
  if (evaluatorType === null || !userId) {
    return data;
  }

  return data.filter((person) => {
    // Verificar si el usuario aparece como el tipo de evaluador especificado
    // en alguna competencia de esta persona
    return person.competenceGroups?.some((group) =>
      group.sub_competences?.some((subComp) =>
        subComp.evaluators?.some(
          (evaluator) =>
            evaluator.evaluator_id === userId &&
            evaluator.evaluator_type === evaluatorType
        )
      )
    );
  });
};

/**
 * Obtiene todos los tipos de evaluador que tiene el usuario para una persona específica
 * @param person Persona a evaluar
 * @param userId ID del usuario logueado
 * @returns Array de números representando los tipos de evaluador
 */
export const getMyEvaluatorTypes = (
  person: EvaluationPersonResultResource,
  userId: number | undefined
): number[] => {
  if (!userId) return [];

  const types = new Set<number>();

  person.competenceGroups?.forEach((group) => {
    group.sub_competences?.forEach((subComp) => {
      subComp.evaluators?.forEach((evaluator) => {
        if (evaluator.evaluator_id === userId) {
          types.add(evaluator.evaluator_type);
        }
      });
    });
  });

  return Array.from(types).sort();
};

/**
 * Cuenta cuántas evaluaciones hay por cada tipo de evaluador
 * @param data Array de personas a evaluar
 * @param userId ID del usuario logueado
 * @returns Objeto con contadores por tipo de evaluador
 */
export const getUserEvaluatorTypeCounts = (
  data: EvaluationPersonResultResource[],
  userId: number | undefined
): Record<number | "all", number> => {
  if (!userId || !data) {
    return { all: 0, 0: 0, 1: 0, 2: 0, 3: 0 };
  }

  const counts: Record<number | "all", number> = {
    all: data.length,
    0: 0, // Jefe
    1: 0, // Auto
    2: 0, // Pares
    3: 0, // Reportes
  };

  data.forEach((person) => {
    const myTypes = getMyEvaluatorTypes(person, userId);
    myTypes.forEach((type) => {
      counts[type] = (counts[type] || 0) + 1;
    });
  });

  return counts;
};

/**
 * Verifica si el usuario tiene rol de evaluador para una persona específica
 * @param person Persona a evaluar
 * @param userId ID del usuario logueado
 * @param evaluatorType Tipo de evaluador específico (opcional)
 * @returns true si el usuario es evaluador
 */
export const isUserEvaluator = (
  person: EvaluationPersonResultResource,
  userId: number | undefined,
  evaluatorType?: number
): boolean => {
  if (!userId) return false;

  return person.competenceGroups?.some((group) =>
    group.sub_competences?.some((subComp) =>
      subComp.evaluators?.some(
        (evaluator) =>
          evaluator.evaluator_id === userId &&
          (evaluatorType === undefined ||
            evaluator.evaluator_type === evaluatorType)
      )
    )
  );
};
