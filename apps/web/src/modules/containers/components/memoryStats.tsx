import { createMemo, createSignal, For, onCleanup } from "solid-js";
import { MemoryIcons } from "../../../global/components/_icons/memory";

const BAR_WIDTH = 3;
const GAP = 5;

export function MemoryStats(props: any) {
  const [width, setWidth] = createSignal<number>(0);
  let observer: ResizeObserver | undefined;

  const parentElement = (el: HTMLDivElement) => {
    observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(el);
  };

  onCleanup(() => observer?.disconnect());
  const bufferSize = createMemo(() => Math.max(1, Math.floor((width() + GAP) / (BAR_WIDTH + GAP))));

  const displayBars = createMemo(() => {
    const cap = bufferSize();
    const list = props.stats || [];

    if (list.length < cap) {
      const pad = new Array(cap - list.length).fill(0);
      return [...pad, ...list.map((item: any) => item?.memory?.memoryUsagePercentage ?? 0)];
    }
    return list.slice(-cap).map((item: any) => item?.memory?.memoryUsagePercentage ?? 0);
  });

  return (
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-center justify-between gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <div class='flex items-center justify-between gap-3'>
          <MemoryIcons size={14} color='#8b4be3' />
          <span class="text-md font-medium">Memory</span>
        </div>
      </div>
      <div
        ref={parentElement}
        class="flex w-full items-end h-20 mt-3 overflow-hidden"
        style={{ gap: `${GAP}px` }}>
        <For each={displayBars()}>
          {(val) => {
            const heightFactor = Math.min(Math.max(val / 100, 0.05), 1);

            return (
              <div
                class="bg-[#8b4be3] origin-bottom transition-all duration-300 rounded-xs shrink-0"
                style={{
                  width: `${BAR_WIDTH}px`,
                  height: "100%",
                  transform: `scaleY(${heightFactor})`,
                }}
              />
            );
          }}
        </For>
      </div>
    </div>
  );
}

