import { createMemo, createSignal, For, onCleanup } from "solid-js";
import { MemoryIcons } from "../../../global/components/_icons/memory";
import { formatBytes, formatRate } from "../mapper";
import { BAR_WIDTH, GAP } from "../constant";

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

  // Buffer size
  const bufferSize = createMemo(() => Math.max(1, Math.floor((width() + GAP) / (BAR_WIDTH + GAP))));

  // Show the read and write bar
  const displayBars = createMemo(() => {
    const cap = bufferSize();
    const list = props.stats || [];
    if (list.length < cap) {
      const pad = new Array(cap - list.length).fill(0);
      return [...pad, ...list.map((item: any) => item?.memory?.memoryUsagePercentage ?? 0)];
    }

    return list.slice(-cap).map((item: any) => item?.memory?.memoryUsagePercentage ?? 0);
  });

  // current memory stats
  const currentMemory = createMemo(() => {
    const list = props.stats;

    return list.at(-1)?.memory ?? {};
  });
  
  return (
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-center justify-between gap-3'>
        <div class='flex items-center justify-between gap-3'>
          <MemoryIcons size={14} color='#8b4be3' />
          <span class="text-md font-medium">Memory</span>
        </div>
        <div>
          <span class='flex text-sm text-gray-500'>
            <h3 class='text-xl text-gray-500'>
              {currentMemory()?.memoryUsagePercentage?.toFixed(2) ?? 0}
            </h3>&nbsp;%
          </span>
        </div>
      </div>
      <div class='flex items-center justify-between pt-5 flex-wrap gap-y-2'>
        <div class='px-3 py-0.5  w-fit rounded-md  flex items-center gap-2 bg-gray-500/20 flex-wrap'>
          <p class='text-gray-500'>Used Memory:</p>{formatBytes(currentMemory()?.usedMemory)}
        </div>
        <div class='flex items-center gap-2 flex-wrap'>
          <div class='px-3 py-0.5  w-fit rounded-md  flex items-center gap-2 bg-gray-500/20 flex-wrap'>
            <p class='text-gray-500'>Total Memory: </p> {formatBytes(currentMemory()?.availableMemory)}
          </div>
          <div class='px-3 py-0.5  bg-gray-500/20 w-fit rounded-md flex items-center gap-2 flex-wrap'>
            <p class='text-gray-500'>Current usage:</p> {formatBytes(currentMemory()?.memoryUsage)}
          </div>
        </div>
      </div>
      <div
        ref={parentElement}
        class="flex w-full items-end h-20 mt-10 overflow-hidden"
        style={{ gap: `${GAP}px` }}>
        <For each={displayBars()}>
          {(val) => {
            const heightFactor = Math.max(val, 1);

            return (
              <div
                class="bg-[#8b4be3] rounded-none shrink-0 origin-bottom transition-all duration-300"
                style={{
                  width: `${BAR_WIDTH}px`,
                  height: `${heightFactor}px`,
                }}
              />
            );
          }}
        </For>
      </div>
    </div>
  );
}

