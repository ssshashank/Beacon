import { createSignal, createEffect, omit, ParentComponent, Show } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveButtonProps, PrimitiveDivProps } from "../../../types/primitive";
import { _CN } from "../../../utils/cn";
import { ExpandContext, useExpand } from "./context";

type ExpandType = {
  children?: JSX.Element;
};

const Expand: ParentComponent<ExpandType> = (props) => {
  const [isOpen, setIsOpen] = createSignal<boolean>(false);
  const toggle = () => setIsOpen((p) => !p);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return <ExpandContext value={{ isOpen, toggle, open, close }}>{props?.children}</ExpandContext>;
};

interface ExpandActionBaseProps extends PrimitiveButtonProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
}
type ExpandActionProps = PolymorphicComponent<ExpandActionBaseProps, "button">;

const ExpandAction = (props: ExpandActionProps) => {
  const rest = omit(props, "children", "style", "ref", "as");

  return (
    <Dynamic
      component={props?.as || "button"}
      ref={props?.ref}
      class={_CN("outline-none cursor-pointer text-sm hover:bg-[#404040] focus:bg-[#404040]", props?.style)}
      {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface ExpandTriggerBaseProps extends PrimitiveButtonProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
}
type ExpandTriggerProps = PolymorphicComponent<ExpandTriggerBaseProps, "button">;

const ExpandTrigger = (props: ExpandTriggerProps) => {
  const rest = omit(props, "children", "style", "ref", "as");
  const ctx = useExpand();

  return (
    <Dynamic
      component={props?.as || "button"}
      ref={props?.ref}
      class={_CN(
        "outline-none cursor-pointer px-1 py-1 rounded text-sm hover:bg-[#292929] focus:bg-[#292929] hover:cursor-pointer",
        props?.style
      )}
      {...rest}
      onClick={ctx?.toggle}>
      {props?.children}
    </Dynamic>
  );
};

interface ExpandContentBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type ExpandContentProps = PolymorphicComponent<ExpandContentBaseProps, "div">;

const ExpandContent = (props: ExpandContentProps) => {
  const rest = omit(props, "children", "style", "ref", "as");
  const ctx = useExpand();

  const [visible, setVisible] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);

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

  return (
    <Show when={mounted()}>
      <Dynamic
        component={props?.as || "div"}
        class={_CN("p-2 bg-gray-100 rounded-sm transition-all duration-300 ease-out", props?.style)}
        style={{
          opacity: visible() ? "1" : "0",
          transform: visible() ? "translateY(0) scale(1)" : "translateY(-6px)",
          "pointer-events": visible() ? "auto" : "none",
        }}
        {...rest}>
        {props?.children}
      </Dynamic>
    </Show>
  );
};

export { Expand, ExpandAction, ExpandTrigger, ExpandContent, useExpand };
