import { IconProps } from "../../types";

export const EjectIcon = (
  { size = 24, color = 'currentColor', strokeWidth = 2, ...others }:
    IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
      {...others}>
      <path d="M4 13a1 1 0 0 1-.72-1.695l7.257-7.668a2 2 0 0 1 2.926 0l7.256 7.668A1 1 0 0 1 20 13z" /><rect x="3" y="17" width="18" height="4" rx="1" />
    </svg>
  );
}

