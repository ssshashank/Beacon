import { Accessor, createContext, useContext } from "solid-js";

type DropdownContextType = {
  isOpen: Accessor<boolean>;
  toggle: () => void;
  open: () => void;
  close: () => void;
  trigger: Accessor<HTMLElement | undefined>;
  content: Accessor<HTMLElement | undefined>;
  setTrigger: (el: HTMLElement) => void;
  setContent: (el: HTMLElement) => void;
};

const DropdownContext = createContext<DropdownContextType>();

const useDropdown = () => {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("Dropdown component must be inside [Dropdown]");

  return ctx;
};

export { useDropdown, DropdownContext };
export type { DropdownContextType };
