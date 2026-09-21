import { createMemo, createSignal, For, onCleanup } from "solid-js";
import { DiskIOIcons } from "../../../global/components/_icons/diskIO";

const BAR_WIDTH = 3;
const GAP = 5;
export function DiskIOStats(props: any) {
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
        ...list.map((item: any) => item?.disk ?? null),
      ];
    }

    return list
      .slice(-cap)
      .map((item: any) => item?.disk ?? null);
  });

  const maxRead = createMemo(() => {
    const values = displayBars()
      .map((item: any) => item?.read ?? 0)
      .filter((value: number) => Number.isFinite(value));

    return Math.max(...values, 0);
  });

  return (
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-start justify-between gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <div class='flex items-center justify-between gap-3'>
          <DiskIOIcons size={14} color='#E56641' />
          <span class="text-md font-medium">Disk</span>
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
                class="bg-[#E56641] origin-bottom rounded-xs shrink-0 transition-transform duration-300"
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
