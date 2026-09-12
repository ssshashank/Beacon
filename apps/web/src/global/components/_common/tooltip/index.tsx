import { createSignal, omit, Show } from "solid-js";
import { Dynamic, Portal } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { PolymorphicComponent, asPolymorphic } from "../../../types";
import { _CN } from "../../../utils/cn";

type Placement = "top" | "bottom" | "left" | "right";

type TooltipType = {
  children?: JSX.Element;
  style?: string;
  placement?: Placement;
};

type TooltipProps<E extends keyof JSX.IntrinsicElements = "button"> = PolymorphicComponent<TooltipType, E>

const GAP = 6;

// The bubble is portaled to <body>, outside that ancestor's box entirely.
function computePosition(rect: DOMRect, placement: Placement) {
  switch (placement) {
    case "bottom":
      return { top: rect.bottom + GAP, left: rect.left + rect.width / 2, transform: "translateX(-50%)" };
    case "left":
      return { top: rect.top + rect.height / 2, left: rect.left - GAP, transform: "translate(-100%, -50%)" };
    case "right":
      return { top: rect.top + rect.height / 2, left: rect.right + GAP, transform: "translateY(-50%)" };
    case "top":
    default:
      return { top: rect.top - GAP, left: rect.left + rect.width / 2, transform: "translate(-50%, -100%)" };
  }
}

export default function Tooltip<E extends keyof JSX.IntrinsicElements = "button">(props: TooltipProps<E>) {
  const p = asPolymorphic<TooltipType>(props);
  const rest = omit(p, "as", "children", "style", "title", "placement", "onMouseEnter", "onMouseLeave");
  const [isHovered, setIsHovered] = createSignal(false);
  const [pos, setPos] = createSignal({ top: 0, left: 0, transform: "" });
  let ref: HTMLElement | undefined;

  const show = () => {
    if (ref) setPos(computePosition(ref.getBoundingClientRect(), p.placement || "right"));
    setIsHovered(true);
  };

  const hide = () => setIsHovered(false);

  return (
    <>
      <Dynamic
        component={p.as || "button"}
        ref={ref}
        class={_CN('', p?.style)}
        title={isHovered() ? undefined : p.title}
        onMouseEnter={show}
        onMouseLeave={hide}
        {...rest}>
        {p.children}
      </Dynamic>
      <Show when={isHovered() && p.title}>
        <Portal>
          <div
            class="tooltip-bubble"
            style={{ top: `${pos().top}px`, left: `${pos().left}px`, transform: pos().transform }}>
            {p.title}
          </div>
        </Portal>
      </Show>
    </>
  );
}
