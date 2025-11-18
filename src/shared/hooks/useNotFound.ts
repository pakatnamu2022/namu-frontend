// src/shared/hooks/useNotFound.ts

import { NotFoundError } from "../errors/NotFoundError";

export function notFound(): never {
  throw new NotFoundError();
}
