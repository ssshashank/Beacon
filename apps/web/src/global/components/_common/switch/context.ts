import { createContext, useContext } from "solid-js";

export type SwitchType = {
  checked?: () => boolean;
  toggle?: () => void;
};

export const SwitchContext = createContext<SwitchType>();
export const useSwitch = () => {
  const ctx = useContext(SwitchContext);
  if (!ctx) throw new Error("Switch component must be inside [Switch]")

  return ctx;
}
