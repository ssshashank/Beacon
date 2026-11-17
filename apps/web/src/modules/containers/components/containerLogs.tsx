import { createEffect, createSignal, For, Show } from "solid-js";
import ContainerStream from "../stream";
import { ContainerLogsDTO } from "../types";

export default function ContainerLogs(props: any) {
  const [logs, setLogs] = createSignal<ContainerLogsDTO[]>([]);
  const [isAtBottom, setIsAtBottom] = createSignal(true);
  let containerRef: HTMLDivElement | undefined;

  const scrollToBottom = () => {
    if (containerRef) {
      containerRef.scrollTop = containerRef.scrollHeight;
    }
  };

  const handleScroll = (e: Event) => {
    const target = e.currentTarget as HTMLDivElement;
    // Consider user "at bottom" if within 60px of the end
    const atBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 60;
    setIsAtBottom(atBottom);
  };

  createEffect(
    () => props.params?.id,
    (id: string) => {
      if (!id) return;

      // Reset logs and scroll state immediately when container ID changes
      setLogs([]);
      setIsAtBottom(true);

      let isDisposed = false;
      const es: EventSource = ContainerStream.streamContainerLogs(id);

      es.onmessage = (event) => {
        if (isDisposed || !event?.data) return;
        try {
          let parsed: ContainerLogsDTO;
          if (typeof event.data === "string" && event.data.startsWith("{")) {
            parsed = JSON.parse(event.data);
          } else {
            parsed = { stream: "stdout", message: event.data };
          }
          setLogs((prev) => [...prev, parsed]);
        } catch {
          setLogs((prev) => [...prev, { stream: "stdout", message: event.data }]);
        }
      };

      es.onerror = () => {
        es.close();
      };

      // Cleanup
      return () => {
        isDisposed = true;
        es.onmessage = null;
        es.onerror = null;
        es.close();
        setLogs([]);
        setIsAtBottom(true);
      };
    }
  );

  // Auto-scroll to bottom whenever new logs arrive (if user hasn't scrolled up)
  createEffect(
    () => logs().length,
    () => {
      if (isAtBottom()) {
        requestAnimationFrame(() => {
          if (isAtBottom()) {
            scrollToBottom();
          }
        });
      }
    }
  );

  return (
    <div class="relative h-full">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        class="rounded-md bg-[#0A0A0B] h-full p-4 overflow-y-auto space-y-1 font-mono text-sm text-gray-300">
        <For each={logs()} fallback={<div class="text-gray-500">No logs found</div>}>
          {(item, index) => (
            <div class="flex items-start gap-2 hover:bg-neutral-900/50 py-0.5 px-1 rounded">
              <span class="text-gray-600 select-none text-xs w-8 text-right shrink-0">
                {index() + 1}.
              </span>
              <span class="break-all whitespace-pre-wrap flex-1">{item.message}</span>
            </div>
          )}
        </For>
      </div>

      <Show when={!isAtBottom() && logs().length > 0}>
        <button
          onClick={() => {
            scrollToBottom();
            setIsAtBottom(true);
          }}
          class="absolute bottom-4 right-6 bg-neutral-900 text-neutral-300 text-xs
          text-black px-3 py-1.5 rounded shadow-lg border border-neutral-700 flex
          items-center gap-1.5 transition-all cursor-pointer">
          <span>↓ Jump to latest</span>
        </button>
      </Show>
    </div>
  );
}
