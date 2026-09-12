import { ParentComponent, omit, createSignal, createEffect, Show, onCleanup, onSettled, For } from "solid-js";
import { Dynamic, Portal } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveButtonProps, PrimitiveDivProps, PrimitiveOptionsProps, PrimitiveParagraphProps, PrimitiveSpanProps } from "../../../types/primitive";
import { _CN } from "../../../utils/cn";
import { createOutsideClick } from "../../../reactivity/createOutsideClick";
import { createFloatingPopper } from "../../../reactivity/createFloatingPopper";
import { SelectContext, SelectItemRecord, useSelect } from "./context";

type SelectType = {
  children?: JSX.Element;
  isMultiple?: boolean;
  selectedColor?: string;
  onValueChange?: (value: SelectItemRecord) => void;
  /** Form value — item.value string, or string[] when isMultiple */
  value?: string | string[];
  /** All choices — lets us show the label before the dropdown is opened */
  options?: SelectItemRecord[];
};

const Select: ParentComponent<SelectType> = (props) => {
  const [isOpen, setOpen] = createSignal(false);
  const [values, setValues] = createSignal<SelectItemRecord[]>([]);
  const [highlighted, setHighlighted] = createSignal(-1);
  const [items, setItems] = createSignal<SelectItemRecord[]>([]);
  const isMulti = props?.isMultiple ?? false;
  const selectedColor = props?.selectedColor ?? "bg-[#7B1509]";
  const [trigger, setTrigger] = createSignal<HTMLElement>();
  const [content, setContent] = createSignal<HTMLElement>();
  const open = () => setOpen(true);
  const close = () => setOpen(false);
  const toggle = () => setOpen((p) => !p);

  const setValue = (item: SelectItemRecord) => {
    setValues([item]);
  };

  const toggleValue = (item: SelectItemRecord) => {
    setValues((prev) => {
      if (isMulti) {
        return prev.find((v) => v.key === item.key) ? prev.filter((v) => v.key !== item.key) : [...prev, item];
      }
      return prev[0]?.value === item.value ? [] : [item];
    });

    props?.onValueChange?.(item);
  };

  const registerItem = (item: SelectItemRecord) => {
    setItems((prev) => (prev.some((i) => i.key === item.key) ? prev : [...prev, item]));
    return items().findIndex((i) => i.key === item.key);
  };

  const syncFromValue = (raw: string | string[] | undefined) => {
    const registered = items();
    if (!registered.length) return;

    const matchOne = (s: string) =>
      registered.find((i) => i.value === s || i.key === s || i.value.toLowerCase() === s.toLowerCase());

    if (isMulti) {
      const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
      const selected = arr.map((s) => matchOne(String(s))).filter((i): i is SelectItemRecord => Boolean(i));
      setValues(selected);
      return;
    }

    const str = Array.isArray(raw) ? raw[0] : raw;
    if (!str) {
      setValues([]);
      return;
    }
    const hit = matchOne(String(str));
    setValues(hit ? [hit] : []);
  };

  createEffect(
    () => [props.options, props.value] as const,
    ([opts, value]) => {
      if (opts?.length) setItems(opts);
      syncFromValue(value);
    }
  );

  createEffect(
    () => [isOpen(), props.value] as const,
    ([open, value]) => {
      if (!open) return;
      syncFromValue(value);
    }
  );

  createEffect(
    () => isOpen(),
    (open) => {
      if (!open) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") close();
      };
      document.addEventListener("keydown", handler);
      onCleanup(() => document.removeEventListener("keydown", handler));
    }
  );

  createOutsideClick(isOpen, trigger, content, close);

  return (
    <SelectContext
      value={{
        isOpen,
        isMulti,
        values,
        highlighted,
        items,
        selectedColor,
        open,
        close,
        toggle,
        setValue,
        toggleValue,
        setHighlighted,
        registerItem,
        trigger,
        content,
        setTrigger,
        setContent,
      }}>
      {props.children}
    </SelectContext>
  );
};

interface SelectTriggerBaseProps extends PrimitiveButtonProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type SelectTriggerProps = PolymorphicComponent<SelectTriggerBaseProps, "button">;

const SelectTrigger = (props: SelectTriggerProps) => {
  const rest = omit(props, "as", "ref", "style", "children");
  const { setTrigger, isOpen, toggle } = useSelect();
  let elRef: HTMLElement | undefined;

  onSettled(() => {
    if (elRef) setTrigger(elRef);
  });

  return (
    <Dynamic
      component={props?.as || "button"}
      ref={(el: HTMLElement) => {
        elRef = el;
        props?.ref?.(el);
      }}
      type="button"
      role="combobox"
      aria-expanded={isOpen() ? true : false}
      aria-autocomplete="none"
      data-state={isOpen() ? "open" : "closed"}
      onClick={toggle}
      class={_CN("flex items-center justify-between cursor-pointer px-1 rounded text-sm w-full outline-none", props?.style)}
      {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface SelectContentBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type SelectContentProps = PolymorphicComponent<SelectContentBaseProps, "div">;

const SelectContent = (props: SelectContentProps) => {
  const rest = omit(props, "children", "style", "ref", "as");
  const ctx = useSelect();
  let elRef: HTMLElement | undefined;

  onSettled(() => {
    if (elRef) ctx.setContent(elRef);
  });

  createEffect(
    () => ctx.isOpen(),
    (open) => {
      if (!open) return;
      return createFloatingPopper(ctx.trigger, ctx.content, "bottom-start", 8);
    }
  );

  return (
    <Show when={ctx.isOpen()}>
      <Portal>
        <Dynamic
          role="listbox"
          aria-multiselectable={ctx?.isMulti}
          aria-labelledby="listbox-label"
          tabindex="0"
          component={props?.as || "div"}
          class={_CN("p-8 bg-gray-100 w-fit rounded-sm shadow-sm", props?.style)}
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

interface SelectItemBaseProps extends PrimitiveOptionsProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
  item?: SelectItemRecord;
}
type SelectItemProps = PolymorphicComponent<SelectItemBaseProps, "option">;

const SelectItem = (props: SelectItemProps) => {
  const rest = omit(props, "children", "ref", "style", "as", "item");
  const ctx = useSelect();

  const [index, setIndex] = createSignal(-1);

  onSettled(() => {
    setIndex(ctx.registerItem(props.item!));
  });

  const isSelected = () => ctx.values().some((v) => v.value === props?.item?.value);
  const isHighlighted = () => ctx.highlighted() === index();

  const onKeyDown = (e: KeyboardEvent) => {
    const total = ctx.items().length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      ctx.setHighlighted((h) => (h + 1) % total);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      ctx.setHighlighted((h) => (h - 1 + total) % total);
    }

    if (e.key === "Enter") {
      const item = ctx.items()[ctx.highlighted()];
      if (item) ctx.toggleValue(item);
    }

    if (e.key === "Escape") ctx.close();
  };

  return (
    <Dynamic
      onKeyDown={onKeyDown}
      onClick={() => {
        ctx.toggleValue(props.item!);
        if (!ctx?.isMulti) ctx.close();
      }}
      onMouseEnter={() => ctx.setHighlighted(index())}
      aria-selected={isSelected()}
      aria-expanded={ctx.isOpen()}
      role="option"
      data-variant="default"
      data-orientation="vertical"
      tabindex={0}
      aria-haspopup="menu"
      component={props?.as || "option"}
      class={_CN(
        "my-1 cursor-pointer px-2 py-1 rounded text-sm w-auto whitespace-nowrap text-left hover:bg-gray-200 focus:outline-gray-200",
        isSelected() ? `${ctx?.selectedColor} text-white hover:${ctx?.selectedColor}` : "",
        isHighlighted() && !isSelected() ? "bg-gray-200" : "",
        props?.style
      )}
      {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface SelectPlaceholderBaseProps extends PrimitiveSpanProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
}
type SelectPlaceholderProps = PolymorphicComponent<SelectPlaceholderBaseProps, "span">;

const SelectPlaceholder = (props: SelectPlaceholderProps) => {
  const ctx = useSelect();

  const display = () => {
    if (!ctx?.values().length) return null;
    return ctx?.isMulti ? (
      <For each={ctx.values()}>
        {(item) => (
          <span class="bg-black shrink-0 text-white px-2 py-1 rounded text-xs flex items-center gap-3">
            {item.value}
            <button
              onClick={(e) => {
                e.stopPropagation();
                ctx.toggleValue(item);
              }}>
              ✕
            </button>
          </span>
        )}
      </For>
    ) : (
      ctx?.values()[0].value
    );
  };

  return (
    <Dynamic component={props?.as || "div"} ref={props?.ref} class={_CN(`${ctx?.values()?.length > 0 ? "text-black" : "text-[#7A7A7B]"}`, props?.style)}>
      {display() ? display() : props?.children}
    </Dynamic>
  );
};

interface SelectErrorBaseProps extends PrimitiveParagraphProps, As {
  children?: JSX.Element;
  ref?: (el: HTMLElement) => void;
  style?: string;
}
type SelectErrorProps = PolymorphicComponent<SelectErrorBaseProps, "p">;

const SelectError = (props: SelectErrorProps) => {
  const rest = omit(props, "children", "as", "style", "ref");
  return (
    <Dynamic ref={props?.ref} component={props.as || "p"} class={_CN("text-red-400 text-xs mt-1", props.style)} {...rest}>
      {props.children}
    </Dynamic>
  );
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectPlaceholder, SelectError, useSelect };
