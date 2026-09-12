import { omit, ParentComponent, createSignal, onSettled, Show } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveDivProps } from "../../../types/primitive";
import { _CN } from "../../../utils/cn";
import { StepperContext, StepRecord, StepStatus, useStepper } from "./context";

type StepperType = {
  children?: JSX.Element;
  defaultValue?: string;
  orientation?: "horizontal" | "vertical";
  onSave?: () => void;
};

const Stepper: ParentComponent<StepperType> = (props) => {
  const [activeStep, setActiveStep] = createSignal<string>(props?.defaultValue || "");
  const [steps, setSteps] = createSignal<StepRecord[]>([]);
  const [orientation] = createSignal<"horizontal" | "vertical">(props?.orientation || "horizontal");

  const registerStep = (step: StepRecord) => {
    const index = steps().length;
    setSteps((prev) => [...prev, { ...step, index }]);
    if (index === 0 && !props?.defaultValue) {
      setActiveStep(step.value);
    }
    return index;
  };

  const registerStepEl = (value: string, el: HTMLElement) => {
    setSteps((prev) => prev.map((s) => (s.value === value ? { ...s, el } : s)));
  };

  const getStatus = (value: string): StepStatus => {
    const activeIndex = steps().findIndex((s) => s.value === activeStep());
    const stepIndex = steps().findIndex((s) => s.value === value);
    if (stepIndex < activeIndex) return "completed";
    if (stepIndex === activeIndex) return "active";
    return "upcoming";
  };

  return (
    <StepperContext
      value={{
        activeStep,
        setActiveStep,
        registerStep,
        registerStepEl,
        steps,
        orientation,
        getStatus,
        onSave: props?.onSave,
      }}>
      {props?.children}
    </StepperContext>
  );
};

interface StepperListBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
}
type StepperListProps = PolymorphicComponent<StepperListBaseProps, "div">;

const StepperList = (props: StepperListProps) => {
  const rest = omit(props, "children", "style", "ref", "as");
  const ctx = useStepper();

  return (
    <Dynamic
      component={props?.as || "div"}
      role="list"
      aria-orientation={ctx.orientation()}
      ref={props?.ref}
      class={_CN(
        "relative flex items-center",
        ctx.orientation() === "vertical" ? "flex-col items-start" : "flex-row",
        props?.style
      )}
      {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface StepperItemBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
  value: string;
  label?: string;
}
type StepperItemProps = PolymorphicComponent<StepperItemBaseProps, "div">;

const StepperItem = (props: StepperItemProps) => {
  const rest = omit(props, "children", "style", "ref", "as", "value", "label");
  const ctx = useStepper();

  const [index, setIndex] = createSignal(-1);
  let elRef: HTMLElement | undefined;

  onSettled(() => {
    setIndex(ctx.registerStep({ value: props.value, index: -1, label: props.label }));
    if (elRef) ctx.registerStepEl(props.value, elRef);
  });

  const status = () => ctx.getStatus(props.value);
  const isLast = () => index() === ctx.steps().length - 1;

  const circleClass = () =>
    _CN(
      "relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold border-2 transition-all duration-300 shrink-0",
      status() === "completed"
        ? "bg-[#7B1509] border-[#7B1509] text-white"
        : status() === "active"
          ? "bg-white border-[#7B1509] text-[#7B1509]"
          : "bg-white border-gray-300 text-gray-400"
    );

  return (
    <Dynamic
      component={props?.as || "div"}
      ref={(el: HTMLElement) => {
        elRef = el;
        props?.ref?.(el);
      }}
      role="listitem"
      data-status={status()}
      class={_CN("flex items-center", ctx.orientation() === "vertical" ? "flex-row w-full" : "flex-col", props?.style)}
      {...rest}>
      <div class={_CN("flex items-center gap-2", ctx.orientation() === "vertical" ? "flex-row" : "flex-col")}>
        <button
          type="button"
          class={circleClass()}
          onClick={() => {
            if (status() === "completed") ctx.setActiveStep(props.value);
          }}
          aria-current={status() === "active" ? "step" : undefined}
          aria-label={props.label || props.value}>
          <Show when={status() === "completed"} fallback={<span>{index() + 1}</span>}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </Show>
        </button>

        <Show when={props.label}>
          <span
            class={_CN(
              "text-xs font-medium whitespace-nowrap transition-colors duration-300",
              status() === "active" ? "text-[#7B1509] font-semibold" : status() === "completed" ? "text-gray-700" : "text-gray-400"
            )}>
            {props.label}
          </span>
        </Show>
      </div>

      <Show when={!isLast()}>
        <div
          class={_CN(
            "transition-all duration-500",
            ctx.orientation() === "vertical" ? "w-0.5 h-8 ml-4 my-1" : "h-0.5 flex-1 mx-2",
            status() === "completed" ? "bg-[#7B1509]" : "bg-gray-200"
          )}
        />
      </Show>
    </Dynamic>
  );
};

interface StepperContentBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
  value: string;
}
type StepperContentProps = PolymorphicComponent<StepperContentBaseProps, "div">;

const StepperContent = (props: StepperContentProps) => {
  const rest = omit(props, "children", "style", "ref", "as", "value");
  const { activeStep } = useStepper();

  return (
    <Show when={activeStep() === props.value}>
      <Dynamic
        component={props?.as || "div"}
        ref={props?.ref}
        role="tabpanel"
        tabindex={0}
        data-state="active"
        class={_CN("focus:outline-none", props?.style)}
        {...rest}>
        {props?.children}
      </Dynamic>
    </Show>
  );
};

interface StepperNavBaseProps extends PrimitiveDivProps, As {
  style?: string;
  ref?: (el: HTMLElement) => void;
  prevLabel?: string;
  nextLabel?: string;
  saveLabel?: string;
  onNext?: (currentValue: string, nextValue: string) => boolean | void;
  onPrev?: (currentValue: string, prevValue: string) => boolean | void;
}
type StepperNavProps = PolymorphicComponent<StepperNavBaseProps, "div">;

const StepperNav = (props: StepperNavProps) => {
  const rest = omit(props, "style", "ref", "as", "prevLabel", "nextLabel", "saveLabel", "onNext", "onPrev");
  const ctx = useStepper();

  const currentIndex = () => ctx.steps().findIndex((s) => s.value === ctx.activeStep());
  const isFirst = () => currentIndex() === 0;
  const isLast = () => currentIndex() === ctx.steps().length - 1;

  const goNext = () => {
    const next = ctx.steps()[currentIndex() + 1];
    if (!next) return;
    if (props?.onNext) {
      const result = props.onNext(ctx.activeStep(), next.value);
      if (result === false) return;
    }
    ctx.setActiveStep(next.value);
  };

  const goPrev = () => {
    const prev = ctx.steps()[currentIndex() - 1];
    if (!prev) return;
    if (props?.onPrev) {
      const result = props.onPrev(ctx.activeStep(), prev.value);
      if (result === false) return;
    }
    ctx.setActiveStep(prev.value);
  };

  return (
    <Dynamic component={props?.as || "div"} ref={props?.ref} class={_CN("flex items-center justify-between mt-6", props?.style)} {...rest}>
      <Show when={!isFirst()} fallback={<div />}>
        <button
          type="button"
          onClick={goPrev}
          class="cursor-pointer px-4 py-1.5 rounded text-sm border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors">
          {props?.prevLabel || "← Prev"}
        </button>
      </Show>

      <Show
        when={!isLast()}
        fallback={
          <button
            type="button"
            onClick={() => ctx.onSave?.()}
            class="cursor-pointer px-4 py-1.5 rounded text-sm bg-[#7B1509] text-white hover:bg-[#5e1007] transition-colors">
            {props?.saveLabel || "Save"}
          </button>
        }>
        <button
          type="button"
          onClick={goNext}
          class="cursor-pointer px-4 py-1.5 rounded text-sm bg-[#7B1509] text-white hover:bg-[#5e1007] transition-colors">
          {props?.nextLabel || "Next →"}
        </button>
      </Show>
    </Dynamic>
  );
};

export { Stepper, StepperList, StepperItem, StepperContent, StepperNav, useStepper };
