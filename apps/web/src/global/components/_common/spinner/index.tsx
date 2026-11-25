import { omit } from "solid-js";

export interface SpinnerProps {
  size?: number;
  class?: string;
  color?: string;
  strokeWidth?: number;
  [key: string]: any;
}

export function Spinner(props: SpinnerProps) {
  const rest = omit(props, "size", "class", "color", "strokeWidth");

  return (
    <svg
      class={`animate-spin ${props.class ?? "text-neutral-400"}`}
      width={props.size ?? 13}
      height={props.size ?? 13}
      viewBox="0 0 24 24"
      fill="none"
      style={{ color: props.color }}
      {...rest}
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width={props.strokeWidth ?? 3} />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default Spinner;
