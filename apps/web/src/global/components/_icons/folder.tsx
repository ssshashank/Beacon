import { omit } from "solid-js";
import { IconProps } from "../../types";

export const FolderIcon = (props: IconProps) => {
  const rest = omit(props, "size", "color", "strokeWidth");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 20 20"
      fill={props.color ?? "currentColor"}
      class="shrink-0"
      {...rest}
    >
      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
    </svg>
  );
};
