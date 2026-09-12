import { Accessor, createContext, useContext } from "solid-js";
import type { OptionKeyValue } from "../../../types/option";

type CheckboxItemRecord = OptionKeyValue;

type CheckboxContextType = {
  values: Accessor<CheckboxItemRecord[]>;
  isSelected: (value: string) => boolean;
  toggleValue: (item: CheckboxItemRecord) => void;
  isMultiple: boolean;
  selectedColor: string;
};

const CheckboxContext = createContext<CheckboxContextType>();

const useCheckbox = () => {
  const ctx = useContext(CheckboxContext);
  if (!ctx) throw new Error("Checkbox component must be inside [Checkbox]");
  return ctx;
};

const CheckboxItemContext = createContext<{ value: string }>();
const useCheckboxItem = () => {
  const ctx = useContext(CheckboxItemContext);
  if (!ctx) throw new Error("CheckboxIndicator must be inside [CheckboxItem]");
  return ctx;
};

export { useCheckbox, CheckboxContext, CheckboxItemContext, useCheckboxItem };
export type { CheckboxItemRecord, CheckboxContextType };
