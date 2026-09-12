import { Accessor, omit, ParentComponent, createSignal, Show } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveDivProps, PrimitiveParagraphProps } from "../../../types/primitive";
import { _CN } from "../../../utils/cn";
import { CheckboxContext, CheckboxItemContext, CheckboxItemRecord, useCheckbox, useCheckboxItem } from "./context";

type CheckboxType = {
  children?: JSX.Element;
  isMultiple?: boolean;
  selectedColor?: string;
  onValueChange?: (values: CheckboxItemRecord[]) => void;
  /** When set, selection is controlled by the parent (e.g. form field value). */
  value?: Accessor<CheckboxItemRecord[]>;
};

const Checkbox: ParentComponent<CheckboxType> = (props) => {
  const isMultiple = props.isMultiple ?? false;
  const selectedColor = props.selectedColor || "#000000";

  const [uncontrolledValues, setUncontrolledValues] = createSignal<CheckboxItemRecord[]>([]);

  const values: Accessor<CheckboxItemRecord[]> = () => (props.value ? props.value() : uncontrolledValues());

  const toggleValue = (item: CheckboxItemRecord) => {
    const prev = values();
    let next: CheckboxItemRecord[];

    if (isMultiple) {
      const exists = prev?.find((s) => s?.value === item?.value);
      next = exists ? prev?.filter((s) => s?.value !== item?.value) : [...prev, item];
    } else {
      const exists = prev?.find((s) => s?.value === item?.value);
      next = exists ? [] : [item];
    }

    props.onValueChange?.(next);

    if (!props.value) {
      setUncontrolledValues(next);
    }
  };

  const isSelected = (value: string) => values()?.some((s) => s?.value === value);

  return (
    <CheckboxContext value={{ values, toggleValue, isSelected, isMultiple, selectedColor }}>
      {props.children}
    </CheckboxContext>
  );
};

interface CheckboxGroupBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
}
type CheckboxGroupProps = PolymorphicComponent<CheckboxGroupBaseProps, "div">;

const CheckboxGroup = (props: CheckboxGroupProps) => {
  const rest = omit(props, "children", "style", "ref", "as");

  return (
    <Dynamic component={props.as || "div"} ref={props.ref} class={_CN("grid grid-cols-1 gap-3", props.style)} {...rest}>
      {props.children}
    </Dynamic>
  );
};

interface CheckboxItemBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
  item: CheckboxItemRecord;
}
type CheckboxItemProps = PolymorphicComponent<CheckboxItemBaseProps, "div">;

const CheckboxItem = (props: CheckboxItemProps) => {
  const rest = omit(props, "children", "style", "ref", "as", "item");
  const ctx = useCheckbox();
  const isChecked = () => ctx.isSelected(props.item.value);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      ctx.toggleValue(props.item);
    }
  };

  return (
    <CheckboxItemContext value={{ value: props.item.value }}>
      <Dynamic
        component={props.as || "div"}
        ref={props.ref}
        role="checkbox"
        aria-checked={isChecked()}
        tabindex={0}
        onClick={() => ctx.toggleValue(props.item)}
        onKeyDown={onKeyDown}
        class={_CN(
          "relative cursor-pointer rounded border-[0.5px] p-4 transition-all duration-200 select-none outline-none",
          isChecked() ? "bg-white border border-gray-700" : "border-gray-400 bg-white hover:bg-gray-50",
          props.style
        )}
        style={{
          ...(isChecked() && {
            "border-color": ctx.selectedColor,
            color: ctx.selectedColor,
          }),
        }}
        {...rest}>
        {props.children}
      </Dynamic>
    </CheckboxItemContext>
  );
};

const CheckboxLabel: PolymorphicComponent<any, "span"> = (props: any) => {
  const rest = omit(props, "children", "style", "as");

  return (
    <Dynamic component={props.as || "span"} class={_CN("block text-sm font-semibold", props.style)} {...rest}>
      {props.children}
    </Dynamic>
  );
};

interface CheckboxIndicatorBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
}
type CheckboxIndicatorProps = PolymorphicComponent<CheckboxIndicatorBaseProps, "div">;

const CheckboxIndicator = (props: CheckboxIndicatorProps) => {
  const rest = omit(props, "children", "style", "ref", "as");
  const itemCtx = useCheckboxItem();
  const ctx = useCheckbox();
  const isChecked = () => ctx.isSelected(itemCtx.value);

  return (
    <Show when={isChecked()}>
      <Dynamic
        component={props?.as || "div"}
        class="w-5 h-5 rounded flex items-center justify-center shadow-sm absolute right-2 top-2"
        style={{ background: ctx.selectedColor }}
        aria-hidden="true"
        {...rest}>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </Dynamic>
    </Show>
  );
};

interface CheckboxErrorBaseProps extends PrimitiveParagraphProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type CheckboxErrorProps = PolymorphicComponent<CheckboxErrorBaseProps, "p">;

const CheckboxError = (props: CheckboxErrorProps) => {
  const rest = omit(props, "children", "as", "style", "ref");
  return (
    <Dynamic ref={props?.ref} component={props.as || "p"} class={_CN("text-red-400 text-xs", props.style)} {...rest}>
      {props.children}
    </Dynamic>
  );
};

export { Checkbox, CheckboxGroup, CheckboxItem, CheckboxLabel, CheckboxIndicator, CheckboxError, useCheckbox };
