import { omit, ParentComponent } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveButtonProps, PrimitiveSpanProps } from "../../../types/primitive";
import { _CN } from "../../../utils/cn";
import { createBGColorGenerator } from "../../../reactivity/createBgColor";

type PillsType = {
  children?: JSX.Element;
  style?: string;
};

const Pills: ParentComponent<PillsType> = (props) => {
  return <div class={_CN("flex flex-wrap items-center gap-1", props?.style)}>{props?.children}</div>;
};

interface PillsActionBaseProps extends PrimitiveButtonProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
  isDismissible?: boolean;
}
type PillsActionProps = PolymorphicComponent<PillsActionBaseProps, "button">;

const PillsAction = (props: PillsActionProps) => {
  const rest = omit(props, "children", "ref", "style", "as", "isDismissible");

  return (
    <Dynamic component={props?.as || "button"} ref={props?.ref} class={_CN("", props?.style)} {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface PillsLabelBaseProps extends PrimitiveSpanProps, As {
  title?: string;
  style?: string;
}
type PillsLabelProps = PolymorphicComponent<PillsLabelBaseProps, "span">;

const PillsLabel = (props: PillsLabelProps) => {
  const rest = omit(props, "title", "style");
  const [bg, text] = createBGColorGenerator(props.title || "");

  return (
    <span
      {...rest}
      style={{
        "background-color": bg() + "70",
        color: text(),
        padding: "4px 10px",
        "border-width": "1px",
        "border-color": bg(),
        "border-radius": "5px",
        "margin-right": "5px",
        "font-size": "12px",
      }}
      class={_CN("", props?.style)}>
      {props.title}
    </span>
  );
};

export { Pills, PillsAction, PillsLabel };
