import { createSignal, createEffect, omit, onCleanup, onSettled, ParentComponent, Show } from "solid-js";
import { Dynamic, Portal } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveButtonProps, PrimitiveDivProps } from "../../../types/primitive";
import { _CN } from "../../../utils/cn";
import { createOutsideClick } from "../../../reactivity/createOutsideClick";
import { createFloatingPopper } from "../../../reactivity/createFloatingPopper";
import { PopoverContext, usePopover } from "./context";

type PopoverType = {
  children?: JSX.Element;
};

const Popover: ParentComponent<PopoverType> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [trigger, setTrigger] = createSignal<HTMLElement>();
  const [content, setContent] = createSignal<HTMLElement>();

  const toggle = () => setIsOpen((p) => !p);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  createEffect(
    () => isOpen(),
    (open) => {
      if (!open) return;
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") close();
      };
      document.addEventListener("keydown", handleEscape);
      onCleanup(() => document.removeEventListener("keydown", handleEscape));
    }
  );

  createOutsideClick(isOpen, trigger, content, close);

  return (
    <PopoverContext value={{ isOpen, toggle, open, close, setTrigger, setContent, trigger, content }}>
      {props?.children}
    </PopoverContext>
  );
};

interface PopoverTriggerBaseProps extends PrimitiveButtonProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type PopoverTriggerProps = PolymorphicComponent<PopoverTriggerBaseProps, "button">;

const PopoverTrigger = (props: PopoverTriggerProps) => {
  const rest = omit(props, "as", "ref", "children", "style");
  const ctx = usePopover();
  let elRef: HTMLElement | undefined;

  onSettled(() => {
    if (elRef) ctx.setTrigger(elRef);
  });

  return (
    <Dynamic
      component={props?.as || "button"}
      type="button"
      ref={(el: HTMLElement) => {
        elRef = el;
        props?.ref?.(el);
      }}
      aria-haspopup="dialog"
      aria-expanded={ctx.isOpen()}
      data-state={ctx.isOpen() ? "open" : "closed"}
      class={_CN(
        "flex min-w-0 cursor-pointer items-center justify-center rounded px-1 text-sm w-full outline-none focus:outline-gray-400",
        props?.style
      )}
      onClick={ctx.toggle}
      {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface PopoverContentBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type PopoverContentProps = PolymorphicComponent<PopoverContentBaseProps, "div">;

const PopoverContent = (props: PopoverContentProps) => {
  const rest = omit(props, "children", "style", "ref", "as");
  const ctx = usePopover();

  const [visible, setVisible] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);
  let elRef: HTMLElement | undefined;

  onSettled(() => {
    if (elRef) ctx.setContent(elRef);
  });

  createEffect(
    () => ctx.isOpen(),
    (open) => {
      if (open) {
        setMounted(true);
        requestAnimationFrame(() => setVisible(true));
      } else {
        setVisible(false);
        setTimeout(() => setMounted(false), 200);
      }
    }
  );

  createEffect(
    () => ctx.isOpen(),
    (open) => {
      if (!open) return;
      return createFloatingPopper(ctx.trigger, ctx.content, "bottom-start", 8);
    }
  );

  return (
    <Show when={mounted()}>
      <Portal>
        <Dynamic
          component={props?.as || "div"}
          class={_CN("p-2 bg-gray-100 rounded-sm transition-all duration-300 ease-out", props?.style)}
          style={{
            opacity: visible() ? "1" : "0",
            transform: visible() ? "translateY(0) scale(1)" : "translateY(-6px)",
            "pointer-events": visible() ? "auto" : "none",
          }}
          ref={(node: HTMLElement) => {
            elRef = node;
            props?.ref?.(node);
          }}
          {...rest}>
          {props?.children}
        </Dynamic>
      </Portal>
    </Show>
  );
};

export { Popover, PopoverTrigger, PopoverContent, usePopover };
