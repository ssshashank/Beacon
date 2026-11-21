import { omit } from "solid-js";
import { IconProps } from "../../types";

export const PlayIcon = (props: IconProps) => {
  const rest = omit(props, "size", "color", "strokeWidth");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size ?? 14}
      height={props.size ?? 14}
      viewBox="0 0 24 24"
      fill={props.color ?? "currentColor"}
      stroke={props.color ?? "currentColor"}
      stroke-width={props.strokeWidth ?? 2}
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-play"
      {...rest}
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
};
