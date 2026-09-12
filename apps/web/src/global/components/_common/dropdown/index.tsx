import { createSignal, createEffect, omit, onSettled, ParentComponent, Show } from "solid-js";
import { Dynamic, Portal } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveButtonProps, PrimitiveDivProps } from "../../../types/primitive";
import { _CN } from "../../../utils/cn";
import { createOutsideClick } from "../../../reactivity/createOutsideClick";
import { createFloatingPopper } from "../../../reactivity/createFloatingPopper";
import { DropdownContext, useDropdown } from "./context";

type DropdownType = {
  children?: JSX.Element;
};

const Dropdown: ParentComponent<DropdownType> = (props) => {
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
      return () => document.removeEventListener("keydown", handleEscape);
    }
  );

  createOutsideClick(isOpen, trigger, content, close);

  return (
    <DropdownContext value={{ isOpen, toggle, open, close, setTrigger, setContent, trigger, content }}>
      {props?.children}
    </DropdownContext>
  );
};

interface DropdownTriggerBaseProps extends PrimitiveButtonProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type DropdownTriggerProps = PolymorphicComponent<DropdownTriggerBaseProps, "button">;

const DropdownTrigger = (props: DropdownTriggerProps) => {
  const rest = omit(props, "as", "ref", "children", "style", "onClick");
  const ctx = useDropdown();
  let elRef: HTMLElement | undefined;

  onSettled(() => {
    if (elRef) ctx.setTrigger(elRef);
  });

  return (
    <Dynamic
      aria-haspopup="menu"
      aria-expanded={ctx.isOpen()}
      data-state={ctx.isOpen() ? "open" : "closed"}
      component={props?.as || "button"}
      ref={(el: HTMLElement) => {
        elRef = el;
        props?.ref?.(el);
      }}
      class={_CN(
        "flex items-center justify-center cursor-pointer px-1 rounded text-sm w-full mx-auto focus:outline-gray-400",
        props?.style
      )}
      onClick={(event: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }) => {
        event.stopPropagation();
        ctx.toggle();
        if (typeof props.onClick === "function") props.onClick(event);
      }}
      {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface DropdownContentBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
  /** Align menu's right edge with the trigger's right edge (for right-side action buttons). */
  alignEnd?: boolean;
}
type DropdownContentProps = PolymorphicComponent<DropdownContentBaseProps, "div">;

const DropdownContent = (props: DropdownContentProps) => {
  const rest = omit(props, "children", "style", "ref", "as", "alignEnd");
  const ctx = useDropdown();

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
      const placement = props.alignEnd ? "bottom-end" : "bottom-start";
      return createFloatingPopper(ctx.trigger, ctx.content, placement, 8);
    }
  );

  return (
    <Show when={mounted()}>
      <Portal>
        <Dynamic
          component={props?.as || "div"}
          role="menu"
          class={_CN(
            "rounded border-[0.5px] border-gray-300 bg-white p-2 shadow-md transition-all duration-200 ease-out",
            props?.style
          )}
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

interface DropdownItemBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type DropdownItemProps = PolymorphicComponent<DropdownItemBaseProps, "div">;

const DropdownItem = (props: DropdownItemProps) => {
  const rest = omit(props, "children", "ref", "style", "as");

  return (
    <Dynamic
      role="menuitem"
      data-slot="dropdown-item"
      data-variant="default"
      data-orientation="vertical"
      tabindex={0}
      aria-haspopup="menu"
      component={props?.as || "div"}
      ref={props?.ref}
      class={_CN(
        "outline-none cursor-pointer px-2 py-1 rounded text-sm mx-auto focus:bg-gray-100 hover:bg-gray-100",
        props?.style
      )}
      {...rest}>
      {props?.children}
    </Dynamic>
  );
};

export { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, useDropdown };
