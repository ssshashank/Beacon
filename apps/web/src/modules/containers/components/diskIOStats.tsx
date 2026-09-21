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

  // Show the read and write bars
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

  // Get the max total from the stream data
  const maxTotal = createMemo(() => {
    const values = displayBars()
      .filter(Boolean)
      .map((item: any) => {
        const read = Number(item?.read ?? 0);
        const write = Number(item?.write ?? 0);

        return read + write;
      });

    return Math.max(...values, 0);
  });

  // Format the disk usage rate
  const formatRate = (bytesPerSecond: number) => {
    if (!bytesPerSecond || bytesPerSecond <= 0) return "0 B/s";

    const kb = bytesPerSecond / 1024;
    if (kb < 1) return `${bytesPerSecond.toFixed(0)} B/s`;

    const mb = kb / 1024;
    if (mb < 1) return `${kb.toFixed(1)} KB/s`;

    const gb = mb / 1024;
    if (gb < 1) return `${mb.toFixed(1)} MB/s`;

    return `${gb.toFixed(2)} GB/s`;
  };

  // Show current disk usage
  const currentDisk = createMemo(() => {
    const list = props.stats;

    return list.at(-1)?.disk ?? {
      read: 0,
      write: 0
    };
  });

  return (
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-start justify-between gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <div class='flex items-center justify-between gap-3'>
          <DiskIOIcons size={14} color='#E56641' />
          <span class="text-md font-medium">Disk</span>
        </div>
        <div class="flex items-center gap-4">
          <span class='text-gray-500'>
            <span class='text-green-500'>↑ </span>{formatRate(currentDisk().read)}
          </span>
          <span class='text-gray-500'>
            <span class='text-red-400'>↓ </span>{formatRate(currentDisk().write)}
          </span>
        </div>
      </div>
      <div
        ref={parentElement}
        class="flex w-full items-end h-20 mt-3 overflow-hidden"
        style={{ gap: `${GAP}px` }}>
        <For each={displayBars()}>
          {(val) => {
            const read = Number(val?.read ?? 0);
            const write = Number(val?.write ?? 0);
            const total = read + write;
            const max = maxTotal();
            const totalHeight = max > 0 ? (total / max) * 100 : 0;
            const readHeight = total > 0 ? (read / total) * totalHeight : 3;
            const writeHeight = total > 0 ? (write / total) * totalHeight : 3;

            return (
              <div
                class="flex h-full shrink-0 flex-col justify-end transition-all origin-bottom"
                style={{
                  width: `${BAR_WIDTH}px`,
                }}>
                <div
                  class="w-full"
                  style={{
                    height: `${writeHeight}%`,
                    "background-color": "#E56641",
                  }}
                />
                <div
                  class="w-full"
                  style={{
                    height: `${readHeight}%`,
                    "background-color": "#F4D35E",
                  }}
                />
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}
