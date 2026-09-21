import { createMemo, createSignal, For, onCleanup } from "solid-js";
import { CPUIcons } from "../../../global/components/_icons/cpu";

const BAR_WIDTH = 3;
const GAP = 5;
export function CPUStats(props: any) {
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

    console.log(props.stats)
    if (list.length < cap) {
      const pad = new Array(cap - list.length).fill(0);
      return [...pad, ...list.map((item: any) => item?.cpu?.current ?? 0)];
    }
    return list.slice(-cap).map((item: any) => item?.cpu?.current ?? 0);
  });

  const currentDisk = createMemo(() => {
    const list = props.stats;

    return list.at(-1)?.cpu?.current ?? 0;
  });


  const peakCPU = createMemo(() => {
    const values = props.stats;
    if (!values.length) return 0;
    return Math.max(...values.map((point: any) => point.cpu.current));
  });

  const avgCPU = createMemo(() => props.stats.reduce((sum: number, point: any) => sum + point.cpu.current, 0) / props.stats.length);

  return (
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-start justify-between gap-3'>
        <div class='flex items-center justify-between gap-3'>
          <CPUIcons size={14} color='#82f969' />
          <span class="text-md font-medium">CPU</span>
        </div>
        <div>
          <span class='flex text-sm text-gray-500'>
            <h3 class='text-xl text-gray-500'>{currentDisk()?.toFixed(2)}
            </h3>&nbsp;%
          </span>
        </div>
      </div>
      <div class='flex items-center justify-between pt-5'>
        <div class='px-3 py-0.5  w-fit rounded-md  flex items-center gap-2 bg-gray-500/20'>
          <p class='text-gray-500'>Cores :</p> {props.cpuCores}
        </div>
        <div class='flex items-center gap-2'>
          <div class='px-3 py-0.5  w-fit rounded-md  flex items-center gap-2 bg-gray-500/20'>
            <p class='text-gray-500'>Avg CPU: </p> {avgCPU()?.toFixed(2)} %
          </div>
          <div class='px-3 py-0.5  bg-gray-500/20 w-fit rounded-md flex items-center gap-2'>
            <p class='text-gray-500'>Peak CPU:</p> {peakCPU()?.toFixed(2)} %
          </div>
        </div>
      </div>
      <div
        ref={parentElement}
        class="flex w-full items-end h-20 mt-10 overflow-hidden"
        style={{ gap: `${GAP}px` }}>
        <For each={displayBars()}>
          {(val) => {
            const heightFactor = Math.min(Math.max(val, 0.05), 1);

            return (
              <div
                class="bg-[#82f969] origin-bottom transition-all duration-300 rounded-xs shrink-0"
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

