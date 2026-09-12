import { Accessor, createContext, useContext } from "solid-js";

type ExpandContextType = {
  isOpen: Accessor<boolean>;
  toggle: () => void;
  open: () => void;
  close: () => void;
};

const ExpandContext = createContext<ExpandContextType>();

const useExpand = () => {
  const ctx = useContext(ExpandContext);
  if (!ctx) throw new Error("Expand component must be inside [Expand]");
  return ctx;
};

export { useExpand, ExpandContext };
export type { ExpandContextType };
