import { Show } from "solid-js";
import { JSX } from "@solidjs/web/jsx-runtime";
import { Spinner } from "../spinner";

export interface SidebarPanelHeaderProps {
  title: string;
  subtitle?: string | JSX.Element;
  badge?: string | number | JSX.Element;
  children?: JSX.Element;
}

export function SidebarPanelHeader(props: SidebarPanelHeaderProps) {
  return (
    <div class="border-b-[0.03px] border-neutral-800 pb-2 flex items-start justify-between gap-2">
      <div class="min-w-0">
        <span class="text-md font-medium text-white">{props.title}</span>
        <Show when={props.subtitle}>
          <div class="text-[11px] text-neutral-500 font-mono mt-0.5">
            {props.subtitle}
          </div>
        </Show>
      </div>
      <div class="flex items-center gap-2 shrink-0 pt-0.5">
        <Show when={props.badge !== undefined && props.badge !== null}>
          <span class="text-[11px] px-1.5 py-0.5 rounded font-mono bg-neutral-800 text-neutral-400">
            {props.badge}
          </span>
        </Show>
        {props.children}
      </div>
    </div>
  );
}

export interface SidebarEmptyStateProps {
  icon: string;
  message: string;
}

export function SidebarEmptyState(props: SidebarEmptyStateProps) {
  return (
    <div class="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
      <img src={props.icon} class="w-28 h-28 opacity-80" />
      <p class="text-sm text-gray-500">{props.message}</p>
    </div>
  );
}

export interface SidebarActionButtonProps {
  title?: string;
  onClick?: (e: MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "danger" | "success" | "warning" | "info" | "default";
  children?: JSX.Element;
}

const VARIANT_HOVER_CLASSES: Record<string, string> = {
  default: "hover:text-white",
  danger: "hover:text-red-400",
  success: "hover:text-emerald-400",
  warning: "hover:text-amber-400",
  info: "hover:text-blue-400",
};

export function SidebarActionButton(props: SidebarActionButtonProps) {
  const variantClass = () => VARIANT_HOVER_CLASSES[props.variant ?? "default"] ?? "hover:text-white";
  const isDisabled = () => Boolean(props.disabled || props.loading);

  return (
    <Show
      when={!props.loading}
      fallback={
        <div class="p-1 flex items-center justify-center">
          <Spinner size={13} />
        </div>
      }
    >
      <button
        type="button"
        title={props.title}
        disabled={isDisabled()}
        onClick={(e) => !isDisabled() && props.onClick?.(e)}
        class={`p-1 rounded text-neutral-400 ${variantClass()} hover:bg-neutral-800 transition-colors cursor-pointer ${
          isDisabled() ? "opacity-30 cursor-not-allowed pointer-events-none" : ""
        }`}
      >
        {props.children}
      </button>
    </Show>
  );
}

export interface SidebarListItemProps {
  isActive?: boolean;
  onClick?: () => void;
  isLast?: boolean;
  color?: string;
  dimmed?: boolean;
  icon: JSX.Element;
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  actions?: JSX.Element;
}

export function SidebarListItem(props: SidebarListItemProps) {
  return (
    <li
      onClick={() => props.onClick?.()}
      class={`p-1 cursor-pointer group/row ${!props.isLast ? "border-b-[0.03px] border-neutral-800" : ""}`}
    >
      <div
        class={`p-2 rounded-md flex items-center justify-between gap-2 ${
          props.isActive ? "bg-[#3B3B3B80]" : "hover:bg-neutral-900/60"
        }`}
      >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div
            class="h-8 w-8 rounded flex items-center justify-center shrink-0 transition-opacity"
            style={{
              color: props.color,
              opacity: props.dimmed ? "0.45" : "1",
            }}
          >
            {props.icon}
          </div>
          <div class="min-w-0 flex-1">
            <p
              class={`text-sm truncate transition-colors ${
                props.dimmed ? "text-neutral-400" : "text-white"
              }`}
            >
              {props.title}
            </p>
            <Show when={props.subtitle}>
              <p
                class={`truncate text-xs transition-colors ${
                  props.dimmed ? "text-neutral-600" : "text-gray-500"
                }`}
              >
                {props.subtitle}
              </p>
            </Show>
          </div>
        </div>

        <Show when={props.actions}>
          <div class="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
            {props.actions}
          </div>
        </Show>
      </div>
    </li>
  );
}
