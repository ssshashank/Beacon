import { omit, ParentComponent } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveImageProps, PrimitiveSpanProps } from "../../../types/primitive";
import { _CN } from "../../../utils/cn";

type CardType = {
  children?: JSX.Element;
  style?: string;
};

const Card: ParentComponent<CardType> = (props) => {
  return <div class={_CN("rounded-sm bg-gray-100", props?.style)}>{props?.children}</div>;
};

interface CardSubtitleBaseProps extends PrimitiveSpanProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
}
type CardSubtitleProps = PolymorphicComponent<CardSubtitleBaseProps, "span">;

const CardSubtitle = (props: CardSubtitleProps) => {
  const rest = omit(props, "children", "style", "ref", "as");

  return (
    <Dynamic component={props?.as || "span"} class={_CN("", props?.style)} ref={props?.ref} {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface CardImageBaseProps extends PrimitiveImageProps {
  style?: string;
}
type CardImageProps = PolymorphicComponent<CardImageBaseProps, "img">;

const CardImage = (props: CardImageProps) => {
  const rest = omit(props, "style");

  return <img class={_CN("w-6 h-6 flex items-center justify-center rounded-md cursor-pointer", props?.style)} {...rest} />;
};

export { Card, CardSubtitle, CardImage };
