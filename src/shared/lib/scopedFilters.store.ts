import { create } from "zustand";

type ScopedFiltersState = {
  scopes: Record<string, Record<string, unknown>>;
  setValue: (scopeKey: string, field: string, value: unknown) => void;
  clearScope: (scopeKey: string) => void;
};

export const useScopedFiltersStore = create<ScopedFiltersState>((set) => ({
  scopes: {},
  setValue: (scopeKey, field, value) =>
    set((state) => ({
      scopes: {
        ...state.scopes,
        [scopeKey]: {
          ...state.scopes[scopeKey],
          [field]: value,
        },
      },
    })),
  clearScope: (scopeKey) =>
    set((state) => {
      if (!(scopeKey in state.scopes)) return state;
      const rest = { ...state.scopes };
      delete rest[scopeKey];
      return { scopes: rest };
    }),
}));
