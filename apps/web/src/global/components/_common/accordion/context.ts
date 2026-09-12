import { createContext, useContext } from "solid-js";

export type AccordionProps = {
  group?: string
};

export const AccordionContext = createContext<AccordionProps>();
export const useAccordion = () => {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion component must be inside [Accordion]")

  return ctx;
};
