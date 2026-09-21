import { ParentComponent, useContext } from "solid-js";
import { _CN } from "../../../utils/cn";
import { JSX } from "@solidjs/web/jsx-runtime";
import { AccordionContext } from "./context";

type AccordionType = {
  children?: JSX.Element
  class?: string
  group?: string
};

export const Accordion: ParentComponent<AccordionType> = (props) => {
  return (
    <AccordionContext value={{ group: props.group }}>
      <div class={_CN("space-y-2", props.class)}>
        {props.children}
      </div>
    </AccordionContext>
  );
};

type AccordionItemType = {
  title: JSX.Element;
  children: JSX.Element;
  open?: boolean;
};

export function AccordionItem(props: AccordionItemType) {
  const ctx = useContext(AccordionContext);

  return (
    <details name={ctx?.group} class="overflow-hidden rounded-md open:bg-[#151619] transition-colors" open={props.open}>
      <summary class="cursor-pointer font-medium p-2 select-none list-none hover:bg-[#151619]">
        {props.title}
      </summary>
      <div class="pl-4 pb-2 pr-2 pt-1 text-white select-none rounded-md">
        {props.children}
      </div>
    </details>
  );
}
