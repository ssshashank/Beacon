import { createStore, createUniqueId } from "solid-js";
import { JSX } from "@solidjs/web/jsx-runtime";

type SoonerVariant = "info" | "success" | "error" | "warning" | "default";

export type SoonerContent = string | (() => JSX.Element);

export type SoonerItem = {
  id: string;
  content: JSX.Element | string;
  variant?: SoonerVariant;
  duration?: number;
};

const rootDisposers = new Map<string, () => void>();

const [state, setState] = createStore<{ sooner: SoonerItem[] }>({
  sooner: [],
});

const addSooner = (sooner: Omit<SoonerItem, "id">, dispose?: () => void): string => {
  const id = "sooner_" + createUniqueId();
  const duration = sooner.duration ?? 5000;

  if (dispose) {
    rootDisposers.set(id, dispose);
  }

  setState((s) => {
    s.sooner.push({ ...sooner, id });
  });

  setTimeout(() => removeSooner(id), duration);
  return id;
};

const removeSooner = (id: string): void => {
  rootDisposers.get(id)?.();
  rootDisposers.delete(id);
  setState((s) => {
    s.sooner = s.sooner.filter((t) => t.id !== id);
  });
};

const clearSooner = (): void => {
  for (const dispose of rootDisposers.values()) {
    dispose();
  }
  rootDisposers.clear();
  setState((s) => {
    s.sooner = [];
  });
};

export { state as soonerState, addSooner, removeSooner, clearSooner };

export type { SoonerVariant };
