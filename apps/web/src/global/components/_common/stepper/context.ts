import { createContext, useContext, Accessor, Setter } from "solid-js";

type StepRecord = {
  value: string;
  index: number;
  label?: string;
  el?: HTMLElement;
};

type StepStatus = "completed" | "active" | "upcoming";

type StepperContextType = {
  activeStep: Accessor<string>;
  setActiveStep: Setter<string>;
  registerStep: (step: StepRecord) => number;
  registerStepEl: (value: string, el: HTMLElement) => void;
  steps: Accessor<StepRecord[]>;
  orientation: Accessor<"horizontal" | "vertical">;
  getStatus: (value: string) => StepStatus;
  onSave?: () => void;
};

const StepperContext = createContext<StepperContextType>();

const useStepper = () => {
  const ctx = useContext(StepperContext);
  if (!ctx) throw new Error("Stepper component must be inside [Stepper]");
  return ctx;
};

export { useStepper, StepperContext };
export type { StepRecord, StepStatus, StepperContextType };
