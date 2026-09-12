import { createRoot } from "solid-js";
import { addSooner, SoonerContent, SoonerVariant } from "./store";
import { SoonerPosition, SoonerBody, SoonerAction } from "./sooner";

const createSooner = (position: SoonerPosition = "top-right") => {
  const triggerSooner = (content: SoonerContent, variant: SoonerVariant = "default", duration?: number) => {
    if (typeof content === "string") {
      addSooner({ content, variant, duration });
      return;
    }

    createRoot((dispose) => {
      addSooner({ content: content(), variant, duration }, dispose);
    });
  };

  const SoonerComponent = () => <SoonerBody position={position} />;

  return { triggerSooner, SoonerComponent };
};

export { createSooner, SoonerAction };
export type { SoonerPosition };
