import { createSignal } from "solid-js";
import { copyToClipboard } from "../utils/clipboard";

/**
 * Generic reactive copy-to-clipboard hook.
 * @param timeout Duration in ms to keep the copied status active (default: 2000ms).
 *
 **/
export function createClipboard(timeout = 2000) {
  const [copiedKey, setCopiedKey] = createSignal<string | boolean>(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const copy = async (textToCopy?: string, key?: string): Promise<boolean> => {
    if (!textToCopy) return false;
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      if (timer) clearTimeout(timer);
      setCopiedKey(key ?? textToCopy);
      timer = setTimeout(() => {
        setCopiedKey(false);
      }, timeout);
    }
    return ok;
  };

  const isCopied = (key?: string) => {
    const val = copiedKey();
    if (key === undefined) return Boolean(val);
    return val === key;
  };

  const copied = () => Boolean(copiedKey());

  return {
    copy,
    copied,
    isCopied,
  };
}
