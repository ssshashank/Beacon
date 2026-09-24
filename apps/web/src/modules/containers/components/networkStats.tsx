import { createMemo, createSignal, For, onCleanup } from "solid-js";
import { NetworkIcons } from "../../../global/components/_icons/network";
import { BAR_WIDTH, GAP } from "../constant";
import { formatRate, formatStreamByte } from "../mapper";

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

  // Show the read and write bar
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

  // Get the max total from the stream data
  const maxTotal = createMemo(() => {
    const values = displayBars()
      .filter(Boolean)
      .map((item: any) => {
        const read = Number(item?.rxKBps ?? 0);
        const write = Number(item?.txKBps ?? 0);

        return read + write;
      });

    return Math.max(...values, 0);
  });

  // Current network usage
  const currentNetwork = createMemo(() => {
    const list = props.stats;

    return list.at(-1)?.network ?? {
      rxKBps: 0,
      txKBps: 0
    };
  });

  return (
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-start justify-between gap-3'>
        <div class='flex items-center justify-between gap-3'>
          <NetworkIcons size={14} color='#ffd600' />
          <span class="text-md font-medium">Network</span>
        </div>
      </div>
      <div class='flex items-center justify-between pt-5 flex-wrap gap-y-2'>
        <div class='flex items-center gap-2 flex-wrap'>
          <div class='px-3 py-0.5  w-fit rounded-md  flex items-center gap-2 bg-gray-500/20 flex-wrap'>
            <p class='text-gray-500'>Read: </p> {formatRate(currentNetwork()?.rxKBps)}
          </div>
          <div class='px-3 py-0.5  bg-gray-500/20 w-fit rounded-md flex items-center gap-2 flex-wrap'>
            <p class='text-gray-500'>Write: </p> {formatRate(currentNetwork()?.txKBps)}
          </div>
        </div>
      </div>
      <div
        ref={parentElement}
        class="flex w-full items-end h-20 mt-10 overflow-hidden"
        style={{ gap: `${GAP}px` }}>
        <For each={displayBars()}>
          {(val) => {
            const read = Number.isNaN(val?.rxKBps) ? 1 : (val?.rxKBps> 0 ? formatStreamByte(val?.rxKBps) : 1);
            const write = Number.isNaN(val?.txKBps) ? 1 : (val?.txKBps > 0 ? formatStreamByte(val?.txKBps) : 1);

            return (
              <div class="flex h-full shrink-0 flex-col justify-end transition-all origin-bottom"
                style={{
                  width: `${BAR_WIDTH}px`,
                }}>
                <div
                  class="w-full"
                  style={{
                    height: `${read}px`,
                    "background-color": "#E56641",
                  }}
                />
                <div
                  class="w-full"
                  style={{
                    height: `${write}px`,
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
