import { createSignal, createEffect, omit, onSettled, ParentComponent, Show } from "solid-js";
import { Dynamic, Portal } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveButtonProps, PrimitiveDivProps, PrimitiveParagraphProps, PrimitiveSpanProps } from "../../../types/primitive";
import { _CN } from "../../../utils/cn";
import { ModalContext, useModal } from "./context";

type ModalType = {
  children?: JSX.Element;
  open?: boolean; // control modal from parent
  onOpenChange?: (val: boolean) => void;
};

const Modal: ParentComponent<ModalType> = (props) => {
  const [internalOpen, setInternalOpen] = createSignal<boolean>(false);
  const [trigger, setTrigger] = createSignal<HTMLElement>();
  const [content, setContent] = createSignal<HTMLElement>();

  const isOpen = () => props.open ?? internalOpen();
  const toggle = () => setOpen(!isOpen());
  const open = () => setOpen(true);
  const close = () => setOpen(false);

  const setOpen = (val: boolean) => {
    if (props.onOpenChange) {
      props.onOpenChange(val);
    } else {
      setInternalOpen(val);
    }
  };

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

  return (
    <ModalContext value={{ isOpen, toggle, open, close, setTrigger, setContent, trigger, content }}>
      {props?.children}
    </ModalContext>
  );
};

interface ModalTriggerBaseProps extends PrimitiveButtonProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type ModalTriggerProps = PolymorphicComponent<ModalTriggerBaseProps, "button">;

const ModalTrigger = (props: ModalTriggerProps) => {
  const rest = omit(props, "as", "children", "ref", "style");
  const ctx = useModal();
  let elRef: HTMLElement | undefined;

  onSettled(() => {
    if (elRef) ctx.setTrigger(elRef);
  });

  return (
    <Dynamic
      component={props?.as || "button"}
      class={_CN("", props?.style)}
      ref={(el: HTMLElement) => {
        elRef = el;
        props?.ref?.(el);
      }}
      onClick={ctx.open}
      {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface ModalContentBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
  /** `center` (default) or `top` — top aligns modal below viewport top with margin */
  placement?: "center" | "top";
}
type ModalContentProps = PolymorphicComponent<ModalContentBaseProps, "div">;

const ModalContent = (props: ModalContentProps) => {
  const rest = omit(props, "as", "children", "ref", "style", "placement");
  const ctx = useModal();
  const [visible, setVisible] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);
  let elRef: HTMLElement | undefined;

  onSettled(() => {
    if (elRef) ctx.setContent(elRef);
  });

  const isTopPlacement = () => (props.placement ?? "center") === "top";

  const dialogLayoutClass = () =>
    isTopPlacement()
      ? {
          base: "border-none p-0 m-0 bg-transparent fixed left-1/2 top-10 max-h-[calc(100vh-3rem)] max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain",
          open: "opacity-100 -translate-x-1/2 translate-y-0 scale-100",
          closed: "opacity-0 -translate-x-1/2 -translate-y-3 scale-95",
        }
      : {
          base: "border-none p-0 m-0 bg-transparent fixed left-1/2 top-1/2 max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain",
          open: "opacity-100 -translate-x-1/2 -translate-y-1/2 scale-100",
          closed: "opacity-0 -translate-x-1/2 -translate-y-[48%] scale-95",
        };

  createEffect(
    () => ctx.isOpen(),
    (open) => {
      if (open) {
        setMounted(true);
        requestAnimationFrame(() => setVisible(true));
      } else {
        setVisible(false);
        setTimeout(() => setMounted(false), 300);
      }
    }
  );

  return (
    <Show when={mounted()}>
      <Portal>
        <div
          class={_CN(
            "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ease-out",
            visible() ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
          onClick={() => ctx.close()}
        />
        <Dynamic
          component={props?.as || "div"}
          data-visible={visible()}
          class={_CN(
            dialogLayoutClass().base,
            "z-50 transition-all duration-300 ease-out",
            visible() ? dialogLayoutClass().open : dialogLayoutClass().closed,
            "rounded-sm bg-gray-100 p-2",
            props?.style
          )}
          ref={(node: HTMLElement) => {
            props?.ref?.(node);
            elRef = node;
          }}
          {...rest}>
          {props?.children}
        </Dynamic>
      </Portal>
    </Show>
  );
};

interface ModalActionButtonBaseProps extends PrimitiveButtonProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type ModalActionButtonProps = PolymorphicComponent<ModalActionButtonBaseProps, "button">;

const ModalActionButton = (props: ModalActionButtonProps) => {
  const rest = omit(props, "as", "children", "ref", "style");

  return (
    <Dynamic component={props?.as || "button"} ref={props?.ref} class={_CN("", props?.style)} {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface ModalTitleBaseProps extends PrimitiveSpanProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type ModalTitleProps = PolymorphicComponent<ModalTitleBaseProps, "span">;

const ModalTitle = (props: ModalTitleProps) => {
  const rest = omit(props, "as", "children", "ref", "style");

  return (
    <Dynamic component={props?.as || "span"} ref={props?.ref} class={_CN("", props?.style)} {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface ModalSubtitleBaseProps extends PrimitiveParagraphProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type ModalSubtitleProps = PolymorphicComponent<ModalSubtitleBaseProps, "p">;

const ModalSubtitle = (props: ModalSubtitleProps) => {
  const rest = omit(props, "as", "children", "ref", "style");

  return (
    <Dynamic component={props?.as || "p"} ref={props?.ref} class={_CN("", props?.style)} {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface ModalCloseBaseProps extends PrimitiveButtonProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type ModalCloseProps = PolymorphicComponent<ModalCloseBaseProps, "button">;

const ModalClose = (props: ModalCloseProps) => {
  const rest = omit(props, "as", "children", "ref", "style");
  const ctx = useModal();

  return (
    <Dynamic component={props?.as || "button"} ref={props?.ref} class={_CN("", props?.style)} onClick={ctx?.close} {...rest}>
      {props?.children}
    </Dynamic>
  );
};

export { Modal, ModalTrigger, ModalContent, ModalTitle, ModalSubtitle, ModalActionButton, ModalClose, useModal };
