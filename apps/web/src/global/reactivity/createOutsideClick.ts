import { isServer } from "@solidjs/web";
import { Accessor, onCleanup } from "solid-js";

export function createOutsideClick(
  isOpen: Accessor<boolean>,
  trigger: Accessor<HTMLElement | undefined>,
  content: Accessor<HTMLElement | undefined>,
  onClose: () => void
) {
  // check for server loading
  if (isServer) return;
  const handler = (e: MouseEvent) => {
    if (!isOpen()) return;

    const target = e.target as Node;
    const t = trigger();
    const c = content();

    if (c && !c.contains(target) && t && !t.contains(target)) {
      onClose();
    }
  }

  window.addEventListener("pointerdown", handler);

  onCleanup(() => {
    window.removeEventListener("pointerdown", handler);
  })
}
