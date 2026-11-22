import { omit } from "solid-js";
import { IconProps } from "../../types";

export const FileIcon = (props: IconProps) => {
  const rest = omit(props, "size", "color", "strokeWidth");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke={props.color ?? "currentColor"}
      stroke-width={props.strokeWidth ?? 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class="shrink-0"
      {...rest}
    >
      <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
};
