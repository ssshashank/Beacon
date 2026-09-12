import { Accessor, createContext, useContext } from "solid-js";

type PopoverContextType = {
  isOpen: Accessor<boolean>;
  toggle: () => void;
  open: () => void;
  close: () => void;
  trigger: Accessor<HTMLElement | undefined>;
  content: Accessor<HTMLElement | undefined>;
  setTrigger: (el: HTMLElement) => void;
  setContent: (el: HTMLElement) => void;
};

const PopoverContext = createContext<PopoverContextType>();

const usePopover = () => {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("Popover component must be inside [Popover]");
  return ctx;
};

export { PopoverContext, usePopover };
export type { PopoverContextType };
