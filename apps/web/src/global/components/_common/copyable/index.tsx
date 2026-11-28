import { Show } from "solid-js";
import { JSX } from "@solidjs/web/jsx-runtime";
import { CopyIcon } from "../../_icons/copy";
import Tooltip from "../tooltip";
import { createClipboard } from "../../../reactivity/createClipboard";
import { _CN } from "../../../utils/cn";

export interface CopyableProps {
  value?: string | number | null;
  display?: string | number | null;
  title?: string;
  align?: "left" | "right";
  iconPosition?: "start" | "end";
  iconSize?: number;
  class?: string;
  textClass?: string;
  children?: JSX.Element;
  showOnHover?: boolean;
}

/**
 * Reusable Copyable component.
 * Displays value with a copy icon (at start or end) and tooltip feedback.
 * Clicking the icon copies the text without triggering parent click events.
 */
export function Copyable(props: CopyableProps) {
  const { copy, copied } = createClipboard();

  const strValue = () => (props.value !== undefined && props.value !== null ? String(props.value) : "");
  const displayText = () => {
    if (props.display !== undefined && props.display !== null) return String(props.display);
    return strValue();
  };
  const titleText = () => props.title ?? strValue();
  const align = () => props.align ?? "left";
  const iconPosition = () => props.iconPosition ?? "start";
  const showOnHover = () => props.showOnHover ?? true;

  const handleCopy = (e: MouseEvent) => {
    e.stopPropagation();
    copy(strValue());
  };

  const copyButton = () => (
    <span
      class={_CN(
        "transition-opacity duration-150 shrink-0 cursor-pointer",
        showOnHover()
          ? (copied() ? "opacity-100" : "opacity-0 group-hover:opacity-100")
          : "opacity-100"
      )}
      onClick={handleCopy}>
      <Tooltip as="span" title={copied() ? "copied" : "copy"}>
        <CopyIcon size={props.iconSize ?? 14} color="gray" />
      </Tooltip>
    </span>
  );

  return (
    <div
      class={_CN(
        "group flex items-center gap-2 min-w-0",
        align() === "right" && "justify-end",
        props.class
      )}>
      <Show when={iconPosition() === "start"}>
        {copyButton()}
      </Show>

      <Show
        when={props.children}
        fallback={
          <span class={props.textClass} title={titleText()}>
            {displayText()}
          </span>
        }>
        {props.children}
      </Show>

      <Show when={iconPosition() === "end"}>
        {copyButton()}
      </Show>
    </div>
  );
}

export default Copyable;
