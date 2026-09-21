import { As, PolymorphicComponent } from "../../../types";
import { PrimitiveButtonProps, PrimitiveDivProps } from "../../../types/primitive";
import { _CN } from "../../../utils/cn";
import { ParentComponent, omit, createSignal, createEffect, onSettled, Show } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { JSX } from "@solidjs/web/jsx-runtime";
import { TabsContext, TabRecord, useTabs } from "./context";

type TabsType = {
  children?: JSX.Element;
  defaultValue?: string;
  orientation?: "horizontal" | "vertical";
  lockedTabs?: string[];
};

const Tabs: ParentComponent<TabsType> = (props) => {
  const [activeTab, setActiveTab] = createSignal<string>(props?.defaultValue || "");
  const [tabs, setTabs] = createSignal<TabRecord[]>([]);
  const [orientation] = createSignal<"horizontal" | "vertical">(props?.orientation || "horizontal");
  const lockedTabs = () => props?.lockedTabs ?? [];

  const registerTab = (tab: TabRecord) => {
    const index = tabs().length;
    setTabs((prev) => [...prev, { ...tab, index }]);
    if (index === 0 && !props?.defaultValue) {
      setActiveTab(tab.value);
    }
    return index;
  };

  const registerTriggerEl = (value: string, el: HTMLElement) => {
    setTabs((prev) => prev.map((t) => (t.value === value ? { ...t, el } : t)));
  };

  return (
    <TabsContext value={{ activeTab, setActiveTab, registerTab, registerTriggerEl, tabs, orientation, lockedTabs }}>
      {props?.children}
    </TabsContext>
  );
};

interface TabsListBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
  indicatorStyle?: string;
}
type TabsListProps = PolymorphicComponent<TabsListBaseProps, "div">;

const TabsList = (props: TabsListProps) => {
  const rest = omit(props, "children", "style", "ref", "as", "indicatorStyle");
  const ctx = useTabs();

  let listEl: HTMLElement;

  const [sliderStyle, setSliderStyle] = createSignal<string>("");

  createEffect(
    () => [ctx.activeTab(), ctx.tabs()] as const,
    ([active, tabs]) => {
      const tab = tabs.find((t) => t.value === active);
      if (!tab?.el || !listEl) return;

      const listRect = listEl.getBoundingClientRect();
      const tabRect = tab.el.getBoundingClientRect();
      const isVertical = ctx.orientation() === "vertical";

      if (isVertical) {
        const top = tabRect.top - listRect.top;
        setSliderStyle(`top: ${top}px; height: ${tabRect.height}px; left: 0; right: 0;`);
      } else {
        const left = tabRect.left - listRect.left;
        const top = tabRect.top - listRect.top;
        setSliderStyle(`left: ${left}px; width: ${tabRect.width}px; top: ${top}px; height: ${tabRect.height}px;`);
      }
    }
  );

  return (
    <Dynamic
      component={props?.as || "div"}
      role="tablist"
      aria-orientation={ctx.orientation()}
      ref={(el: HTMLElement) => {
        listEl = el;
        props?.ref?.(el);
      }}
      class={_CN("relative flex", ctx.orientation() === "vertical" ? "flex-col" : "flex-row", props?.style)}
      {...rest}>
      <div
        aria-hidden="true"
        style={sliderStyle()}
        class={_CN(
          "absolute rounded transition-all duration-300 ease-in-out bg-[#801A00] z-0 pointer-events-none",
          props?.indicatorStyle
        )}
      />
      {props?.children}
    </Dynamic>
  );
};

interface TabsTriggerBaseProps extends PrimitiveButtonProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
  value: string;
}
type TabsTriggerProps = PolymorphicComponent<TabsTriggerBaseProps, "button">;

const TabsTrigger = (props: TabsTriggerProps) => {
  const rest = omit(props, "children", "style", "ref", "as", "value");
  const ctx = useTabs();

  const [index, setIndex] = createSignal(-1);
  let elRef: HTMLElement | undefined;

  onSettled(() => {
    setIndex(ctx.registerTab({ value: props.value, index: -1 }));
    if (elRef) ctx.registerTriggerEl(props.value, elRef);
  });

  const isActive = () => ctx.activeTab() === props.value;
  const isLocked = () => ctx.lockedTabs().includes(props.value);

  const onKeyDown = (e: KeyboardEvent) => {
    const total = ctx.tabs().length;
    const isVertical = ctx.orientation() === "vertical";

    const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";
    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";

    if (e.key === nextKey) {
      e.preventDefault();
      const next = ctx.tabs()[(index() + 1) % total];
      if (next && !ctx.lockedTabs().includes(next.value)) ctx.setActiveTab(next.value);
    }

    if (e.key === prevKey) {
      e.preventDefault();
      const prev = ctx.tabs()[(index() - 1 + total) % total];
      if (prev && !ctx.lockedTabs().includes(prev.value)) ctx.setActiveTab(prev.value);
    }

    if (e.key === "Home") {
      e.preventDefault();
      const first = ctx.tabs()[0];
      if (first && !ctx.lockedTabs().includes(first.value)) ctx.setActiveTab(first.value);
    }

    if (e.key === "End") {
      e.preventDefault();
      const last = ctx.tabs()[total - 1];
      if (last && !ctx.lockedTabs().includes(last.value)) ctx.setActiveTab(last.value);
    }
  };

  return (
    <Dynamic
      component={props?.as || "button"}
      ref={(el: HTMLElement) => {
        elRef = el;
        props?.ref?.(el);
      }}
      role="tab"
      type="button"
      tabindex={isActive() ? 0 : 0}
      aria-selected={isActive()}
      aria-disabled={isLocked()}
      data-state={isActive() ? "active" : "inactive"}
      onClick={() => {
        if (!isLocked()) ctx.setActiveTab(props.value);
      }}
      onKeyDown={onKeyDown}
      class={_CN(
        "relative z-10 px-3 py-1 rounded text-sm transition-colors duration-300 focus:outline-none",
        isActive() ? "text-white" : "text-gray-600",
        isLocked() ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
        props?.style
      )}
      {...rest}>
      {props?.children}
    </Dynamic>
  );
};

interface TabsContentBaseProps extends PrimitiveDivProps, As {
  children?: JSX.Element;
  style?: string;
  ref?: (el: HTMLElement) => void;
  value: string;
}
type TabsContentProps = PolymorphicComponent<TabsContentBaseProps, "div">;

const TabsContent = (props: TabsContentProps) => {
  const rest = omit(props, "children", "style", "ref", "as", "value");
  const { activeTab } = useTabs();

  return (
    <Show when={activeTab() === props.value}>
      <Dynamic
        component={props?.as || "div"}
        ref={props?.ref}
        role="tabpanel"
        tabindex={0}
        data-state="active"
        class={_CN("focus:outline-none", props?.style)}
        {...rest}>
        {props?.children}
      </Dynamic>
    </Show>
  );
};

interface TabsNavBaseProps extends PrimitiveDivProps, As {
  style?: string;
  ref?: (el: HTMLElement) => void;
  prevLabel?: string;
  nextLabel?: string;
  saveLabel?: string;
  onSave?: () => boolean | void | Promise<boolean | void>;
  onNext?: (currentValue: string, nextValue: string) => boolean | void | Promise<boolean | void>;
  onPrev?: (currentValue: string, prevValue: string) => boolean | void;
}
type TabsNavProps = PolymorphicComponent<TabsNavBaseProps, "div">;

const TabsNav = (props: TabsNavProps) => {
  const rest = omit(props, "style", "ref", "as", "prevLabel", "nextLabel", "saveLabel", "onNext", "onPrev", "onSave");
  const ctx = useTabs();

  const currentIndex = () => ctx.tabs().findIndex((t) => t.value === ctx.activeTab());
  const isFirst = () => currentIndex() === 0;
  const isLast = () => currentIndex() === ctx.tabs().length - 1;

  const goNext = async () => {
    const next = ctx.tabs()[currentIndex() + 1];
    if (!next) return;
    if (props?.onNext) {
      const result = await props.onNext(ctx.activeTab(), next.value);
      if (result === false) return;
    }
    ctx.setActiveTab(next.value);
  };

  const goPrev = () => {
    const prev = ctx.tabs()[currentIndex() - 1];
    if (!prev) return;
    if (props?.onPrev) {
      const result = props.onPrev(ctx.activeTab(), prev.value);
      if (result === false) return;
    }
    ctx.setActiveTab(prev.value);
  };

  return (
    <Dynamic component={props?.as || "div"} ref={props?.ref} class={_CN("flex items-center justify-between mt-4", props?.style)} {...rest}>
      <Show when={!isFirst()} fallback={<div />}>
        <button
          type="button"
          onClick={goPrev}
          class="cursor-pointer px-4 py-1.5 rounded text-sm border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors">
          {props?.prevLabel || "← Prev"}
        </button>
      </Show>
      <Show
        when={!isLast()}
        fallback={
          <button
            type="submit"
            onClick={props?.onSave}
            class="cursor-pointer px-4 py-1.5 rounded text-sm bg-[#FF5200] text-white hover:bg-[#FF520090] transition-colors">
            {props?.saveLabel || "Save"}
          </button>
        }>
        <button
          type="button"
          onClick={goNext}
          class="cursor-pointer px-4 py-1.5 rounded text-sm bg-[#FF5200] text-white hover:bg-[#FF520090] transition-colors">
          {props?.nextLabel || "Next →"}
        </button>
      </Show>
    </Dynamic>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsNav, useTabs };
