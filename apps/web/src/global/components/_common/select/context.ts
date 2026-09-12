import { Accessor, createContext, Setter, useContext } from "solid-js";
import type { OptionKeyValue } from "../../../types/option";

type SelectItemRecord = OptionKeyValue;

type SelectContextType = {
  isOpen: Accessor<boolean>;
  isMulti: boolean;
  values: Accessor<SelectItemRecord[]>;
  highlighted: Accessor<number>;
  items: Accessor<SelectItemRecord[]>;
  selectedColor: string;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setValue: (value: SelectItemRecord) => void;
  toggleValue: (value: SelectItemRecord) => void;
  setHighlighted: Setter<number>;
  registerItem: (item: SelectItemRecord) => number;
  trigger: Accessor<HTMLElement | undefined>;
  content: Accessor<HTMLElement | undefined>;
  setTrigger: (el: HTMLElement) => void;
  setContent: (el: HTMLElement) => void;
};

const SelectContext = createContext<SelectContextType>();

const useSelect = () => {
  const ctx = useContext(SelectContext);
  if (!ctx) throw new Error("Select component must be inside [Select]");
  return ctx;
};

export { useSelect, SelectContext };
export type { SelectContextType, SelectItemRecord };
