import { createMemo, createSignal, For, onCleanup } from "solid-js";
import { NetworkIcons } from "../../../global/components/_icons/network";

const BAR_WIDTH = 3;
const GAP = 5;
export function NetworkStats(props: any) {
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
      const pad = new Array(cap - list.length).fill(null);

      return [
        ...pad,
        ...list.map((item: any) => item?.network ?? null),
      ];
    }

    return list
      .slice(-cap)
      .map((item: any) => item?.network ?? null);
  });

  const maxRead = createMemo(() => {
    const values = displayBars()
      .map((item: any) => item?.rxKBps ?? 0)
      .filter((value: number) => Number.isFinite(value));

    return Math.max(...values, 0);
  });


  return (
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-start justify-between gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <div class='flex items-center justify-between gap-3'>
          <NetworkIcons size={14} color='#ffd600' />
          <span class="text-md font-medium">Network</span>
        </div>
      </div>
      <div
        ref={parentElement}
        class="flex w-full items-end h-20 mt-3 overflow-hidden"
        style={{ gap: `${GAP}px` }}>
        <For each={displayBars()}>
          {(val) => {
            const read = val?.read ?? 0;
            const max = maxRead();
            const heightFactor = max > 0 ? read / max : 0.05;

            return (
              <div
                class="bg-[#ffd600] origin-bottom transition-all duration-300 rounded-xs shrink-0"
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
