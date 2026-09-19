import { createEffect, createMemo, createSignal, For, Loading, onCleanup } from "solid-js";
import { BASE_URL } from "../../../global/constants/network";
import { StatPoint } from "../types";
import { CPUIcons } from "../../../global/components/_icons/cpu";
import { MemoryIcons } from "../../../global/components/_icons/memory";

const BAR_WIDTH = 3;
const GAP = 5;

function CPUStats(props: any) {
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
      return [...pad, ...list.map((item: any) => item?.cpu?.avg ?? 0)];
    }
    return list.slice(-cap).map((item: any) => item?.cpu?.avg ?? 0);
  });

  return (
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-start justify-between gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <div class='flex items-center justify-between gap-3'>
          <CPUIcons size={14} color='#82f969' />
          <span class="text-md font-medium">CPU</span>
        </div>
        <div>
          <span class="text-normal text-gray-500 font-medium">
            {props.cpuCores()} cores
          </span>

        </div>
      </div>
      <div
        ref={parentElement}
        class="flex w-full items-end h-20 mt-3 overflow-hidden"
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

function MemoryStats(props: any) {
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

// Memory Stats Formatter
const formatMemoryStats = (data: any) => {
  const memoryStats = data?.memory_stats;
  const availableMemory = memoryStats?.limit ?? 0;
  const memoryUsage = memoryStats?.usage ?? 0;

  // cgroups v2 uses inactive_file; cgroups v1 uses cache
  const inactiveFile =
    memoryStats?.stats?.inactive_file ?? memoryStats?.stats?.cache ?? 0;

  const usedMemory = Math.max(0, memoryUsage - inactiveFile);
  const memoryUsagePercentage =
    availableMemory > 0 ? (usedMemory / availableMemory) * 100.0 : 0;

  return {
    availableMemory,
    memoryUsage,
    usedMemory,
    memoryUsagePercentage: Math.max(0, Math.min(Number.isFinite(memoryUsagePercentage) ? memoryUsagePercentage : 0, 100))
  };
};

// CPU Stats formatter
function formatCPUStats(data: any) {
  const cpuStats = data?.cpu_stats;
  const preCpuStats = data?.precpu_stats;

  if (!preCpuStats?.cpu_usage?.total_usage) return;

  const numberCpus =
    cpuStats.online_cpus ??
    cpuStats.cpu_usage.percpu_usage?.length ??
    preCpuStats.online_cpus ??
    preCpuStats.cpu_usage.percpu_usage?.length ??
    1;

  const currentTotalUsage = cpuStats.cpu_usage.total_usage;
  const previousTotalUsage = preCpuStats.cpu_usage.total_usage;
  const currentSystemUsage = cpuStats.system_cpu_usage;
  const previousSystemUsage = preCpuStats.system_cpu_usage ?? 0;
  let cpuPercentage = 0;

  if (previousTotalUsage > 0 && previousSystemUsage > 0) {
    const cpuDelta = currentTotalUsage - previousTotalUsage;
    const systemCpuDelta = currentSystemUsage - previousSystemUsage;

    if (systemCpuDelta > 0) {
      cpuPercentage = (cpuDelta / systemCpuDelta) * numberCpus * 100;
    }
  }

  return {
    cpuPercentage,
    numberCpus,
  };
}

export default function ContainerStats(props: any) {
  const [stats, setStats] = createSignal<StatPoint[]>([]);
  const [cpuCores, setCpuCores] = createSignal<number>(0);
  const [currentPids, setCurrentPids] = createSignal(0);
  const [pidsLimit, setPidsLimit] = createSignal(0);
  const [isConnected, setIsConnected] = createSignal(false);

  createEffect(
    () => props.params?.id,
    (id: string) => {
      if (!id) return;
      const es = new EventSource(`${BASE_URL}/containers/getContainerResourceUsageStatsById/${id}`);

      es.onopen = () => setIsConnected(true);

      es.onmessage = (event) => {
        if (!event?.data) return;
        const data = JSON.parse(event.data);
        const memoryStats = formatMemoryStats(data);
        const cpuStats: any = formatCPUStats(data);
        if (!cpuCores()) {
          setCpuCores(cpuStats?.numberCpus);
        }
        setCurrentPids(data.pids_stats?.current ?? 0);
        setPidsLimit(data.pids_stats?.limit ?? 0);

        const point: StatPoint = {
          time: data.read,
          cpu: {
            avg: Math.max(0, Math.min(Number.isFinite(cpuStats?.cpuPercentage) ? cpuStats?.cpuPercentage : 0, 100)),
          },
          memory: memoryStats
        };

        setStats((prev) => {
          const next = [...prev, point];
          return next.length > 1000 ? next.slice(-1000) : next;
        });
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
      };

      return () => {
        setIsConnected(false);
        es.close();
      };
    }
  );


  return (
    <div class="rounded-md bg-[#0A0A0B] h-full">
      <div class="p-1 grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 gap-y-2">
        <Loading fallback={<h1>CPU Stats loading...</h1>}>
          <CPUStats stats={stats()} cpuCores={cpuCores} />
        </Loading>
        <Loading fallback={<h1>Memory Stats loading...</h1>}>
          <MemoryStats stats={stats()} />
        </Loading>
      </div>
    </div>
  );
}
