import { JSX } from "@solidjs/web/jsx-runtime";

export function DetailEmptyState(props: {
  icon: JSX.Element;
  message: string;
}) {
  return (
    <div class="w-full h-full flex flex-col items-center justify-center text-neutral-500 gap-3 select-none">
      {props.icon}
      <span class="text-sm">{props.message}</span>
    </div>
  );
}
