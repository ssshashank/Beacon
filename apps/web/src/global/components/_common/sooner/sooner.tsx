import { omit, For, createSignal, onSettled } from "solid-js";
import { Dynamic, Portal } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveButtonProps } from "../../../types/primitive";
import { _CN } from "../../../utils/cn";
import { SoonerItem, soonerState, SoonerVariant } from "./store";

const _soonerPositionStyles = {
  "top-left": "top-4 left-4 items-start",
  "top-right": "top-4 right-4 items-end",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-right": "bottom-4 right-4 items-end",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
} as const;
type SoonerPosition = keyof typeof _soonerPositionStyles;

const _soonerVariantStyle: Record<SoonerVariant, string> = {
  default: "bg-zinc-900 text-white border border-zinc-700",
  success: "bg-[#EDFDF3] text-[#008A2E] border-[0.2px] border-[#008A2E80]",
  error: "bg-[#FFEFF0] text-[#E60001] border-[0.2px] border-[#E6000180]",
  warning: "bg-[#FFFCF0] text-[#DC770A] border-[0.2px] border-[#DC770A80]",
  info: "bg-[#EFF8FF] text-[#0B73DC] border-[0.2px] border-[#0B73DC80]",
};

interface SoonerActionBaseProps extends PrimitiveButtonProps, As {
  children?: JSX.Element;
  onClick?: (e: MouseEvent) => void;
  style?: string;
}
type SoonerActionProps = PolymorphicComponent<SoonerActionBaseProps, "button">;

const SoonerAction = (props: SoonerActionProps) => {
  const rest = omit(props, "children", "as", "style", "onClick");

  return (
    <Dynamic
      component={props.as ?? "button"}
      onClick={props.onClick}
      class={_CN(
        "mt-1 text-xs underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity cursor-pointer",
        props.style
      )}
      {...rest}>
      {props.children}
    </Dynamic>
  );
};

type SoonerItemCardProps = {
  sooner: SoonerItem;
};

const SoonerItemCard = (props: SoonerItemCardProps) => {
  const [visible, setVisible] = createSignal<boolean>(false);

  onSettled(() => {
    requestAnimationFrame(() => setVisible(true));
  });

  const variantStyle = _soonerVariantStyle[props.sooner.variant ?? "default"];

  return (
    <div
      class={_CN(
        "relative flex items-center justify-between gap-3 px-4 py-3 rounded shadow-md bg-white border",
        "min-w-[240px] max-w-sm w-full",
        "transition-all duration-300 ease-out",
        variantStyle,
        visible() ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
      )}
      role="status"
      aria-live="polite">
      <div class="flex-1 min-w-0">
        {typeof props.sooner.content === "string" ? <span>{props.sooner.content}</span> : props.sooner.content}
      </div>
    </div>
  );
};

type SoonerBodyProps = {
  position?: SoonerPosition;
  class?: string;
};

const SoonerBody = (props: SoonerBodyProps) => {
  const positionStyle = () => _soonerPositionStyles[props.position ?? "top-right"];

  return (
    <Portal mount={document.body}>
      <div class={_CN("pointer-events-none fixed z-[110] flex flex-col gap-2", positionStyle(), props.class)} aria-label="Notifications">
        <For each={soonerState.sooner}>
          {(sooner) => (
            <div class="pointer-events-auto">
              <SoonerItemCard sooner={sooner} />
            </div>
          )}
        </For>
      </div>
    </Portal>
  );
};

export { SoonerAction, SoonerBody };
export type { SoonerPosition };
