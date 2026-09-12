import { Accessor, createContext, useContext } from "solid-js";

type ModalContextType = {
  isOpen: Accessor<boolean>;
  toggle: () => void;
  open: () => void;
  close: () => void;
  trigger: Accessor<HTMLElement | undefined>;
  content: Accessor<HTMLElement | undefined>;
  setTrigger: (el: HTMLElement) => void;
  setContent: (el: HTMLElement) => void;
};

const ModalContext = createContext<ModalContextType>();

const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Modal component must be inside [Modal]");

  return ctx;
};

export { useModal, ModalContext };
export type { ModalContextType };
