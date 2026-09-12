import { Component, omit } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveButtonProps, PrimitiveParagraphProps } from "../../../types/primitive";
import { _CN } from "../../../utils/cn";

interface ButtonBaseProps extends PrimitiveButtonProps {
  as?: keyof JSX.IntrinsicElements | Component<any>;
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  class?: string;
  type?: "reset" | "submit" | "button";
}
type ButtonProps = PolymorphicComponent<ButtonBaseProps, "button">;

const Button = (props: ButtonProps) => {
  const rest = omit(props, "as", "ref", "children", "class", "type");

  return (
    <Dynamic
      component={props.as || "button"}
      ref={props.ref}
      type={props?.type || "button"}
      class={_CN("flex items-center justify-center gap-3 outline-none cursor-pointer p-3 rounded text-[1rem] bg-btn-bg", props?.class)}
      {...rest}>
      {props.children}
    </Dynamic>
  );
};

interface ButtonTextBaseProps extends PrimitiveParagraphProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type ButtonTextProps = PolymorphicComponent<ButtonTextBaseProps, "p">;

const ButtonText = (props: ButtonTextProps) => {
  const rest = omit(props, "children", "as", "style");
  return (
    <Dynamic component={props?.as || "p"} class={_CN("text-sm", props?.style)} {...rest}>
      {props?.children}
    </Dynamic>
  );
};

export { Button, ButtonText };
