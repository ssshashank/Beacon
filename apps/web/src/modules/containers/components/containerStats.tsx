import { createEffect, createMemo, createSignal, For, Loading } from "solid-js";
import { BASE_URL } from "../../../global/constants/network";
import { CPUIcons } from "../../../global/components/_icons/cpu";
import { MemoryIcons } from "../../../global/components/_icons/memory";

function CPUStats(props: any) {
  const [width, setWidth] = createSignal<number>(0);
  let observer: ResizeObserver | undefined;
  const barWidth = 3;
  const gap = 2;

  const setGraphElement = (el: HTMLDivElement) => {
    observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });

    observer.observe(el);
  };

  const cpuUsage = createMemo(() => (props?.stats && props?.stats?.length > 0) ? props?.stats?.at(-1)?.cpu : []);
  const peakCPU = createMemo(() => {
    const values = props.stats;

    if (!values.length) return 0;

    return Math.max(...values.map((point: any) => point.cpu.avg));
  });

  return (
    <div class="h-fit rounded bg-[#151619] p-3">
      <div class="flex items-center justify-between gap-3 border-b pb-3 border-neutral-700">
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
        ref={setGraphElement}
        class="mt-3 h-20 flex items-end overflow-hidden"
        style={{
          gap: `${gap}px`,
        }}>
        <For each={props.stats}>
          {(point) => (
            <div
              class={`bg-[#82f969] flex-1`}
              style={{
                "min-width": `${barWidth}px`,
                height: `${Math.max(point.cpu.avg, 1)}%`,
              }}
            />
          )}
        </For>
      </div>
    </div>
  );
}

function MemoryStats(props: any) {
  const [width, setWidth] = createSignal<number>(0);
  let observer: ResizeObserver | undefined;
  const barWidth = 3;
  const gap = 2;

  const setGraphElement = (el: HTMLDivElement) => {
    observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });

    observer.observe(el);
  };

  return (
    <div class="h-fit rounded bg-[#151619] p-3">
      <div class="flex items-center justify-between gap-3 border-b pb-3 border-neutral-700">
        <div class='flex items-center justify-between gap-3'>
          <MemoryIcons size={14} color='#8b4be3' />
          <span class="text-md font-medium">Memory</span>
        </div>
      </div>
      <div
        ref={setGraphElement}
        class="mt-3 h-20 flex items-end overflow-hidden"
        style={{
          gap: `${gap}px`,
        }}>
        <For each={props.stats}>
          {(point) => (
            <div
              class={`bg-[#8b4be3] flex-1`}
              style={{
                "min-width": `${barWidth}px`,
                height: `${Math.max(point.memory.memoryUsagePercentage, 1)}%`,
              }}
            />
          )}
        </For>
      </div>
    </div>
  );
}

type StatPoint = {
  time: string;
  cpu: {};
  memory: {};
  network?: {
    rx: number;
    tx: number;
  };
  disk?: {
    read: number;
    write: number;
  };
  pids?: number;
};


const formatMemoryUsageData = (data: any) => {
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
    memoryUsagePercentage
  };
};
export default function ContainerStats(props: any) {
  const [stats, setStats] = createSignal<any[]>([]);
  const [cpuCores, setCpuCores] = createSignal<number>(0);
  const [currentPids, setCurrentPids] = createSignal(0);
  const [pidsLimit, setPidsLimit] = createSignal(0);
  const [isConnected, setIsConnected] = createSignal(false);

  createEffect(
    () => props.params.id,
    (id: string) => {
      if (!id!) return;
      const es = new EventSource(`${BASE_URL}/containers/getContainerResourceUsageStatsById/${id!}`);

      es.onopen = () => {
        setIsConnected(true);
      };

      // on stream
      es.onmessage = (event) => {
        if (!event?.data) return;
        const data = JSON.parse(event.data);
        const memoryUsageStats = formatMemoryUsageData(data);
        const cpuStats = data?.cpu_stats;
        const preCpuStats = data?.precpu_stats;

        // first packet
        if (!preCpuStats?.cpu_usage?.total_usage) return;

        const numberCpus =
          cpuStats.online_cpus ??
          cpuStats.cpu_usage.percpu_usage?.length ??
          preCpuStats.online_cpus ??
          preCpuStats.cpu_usage.percpu_usage?.length ??
          1;

        if (!cpuCores()) {
          setCpuCores(numberCpus);
        }

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

        setCurrentPids(data.pids_stats.current);
        setPidsLimit(data.pids_stats.limit);

        const point: StatPoint = {
          time: data.read,
          cpu: {
            avg: Math.max(0, Math.min(Number.isFinite(cpuPercentage) ? cpuPercentage : 0, 100)),
          },
          memory: memoryUsageStats,
        };

        setStats((prev) => [
          ...prev.slice(-49),
          point,
        ]);
      };

      // on error
      es.onerror = (err) => {
        setIsConnected(false);
        es.close();
      };

      // cleanup
      return () => {
        setIsConnected(false);
        es.close();
      };
    }
  );

  return (
    <div class="rounded-md bg-[#0A0A0B] h-full">
      <div class='p-1 grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 gap-y-2'>
        <Loading fallback={<h1>CPU Stats Loading...</h1>}>
          <CPUStats stats={stats()} cpuCores={cpuCores} isConnected={isConnected} />
        </Loading>
        <Loading fallback={<h1>CPU Stats Loading...</h1>}>
          <MemoryStats stats={stats()} cpuCores={cpuCores} isConnected={isConnected} />
        </Loading>

        <Loading fallback={<h1>CPU Stats Loading...</h1>}>
          <MemoryStats stats={stats()} cpuCores={cpuCores} isConnected={isConnected} />
        </Loading>

        <Loading fallback={<h1>CPU Stats Loading...</h1>}>
          <MemoryStats stats={stats()} cpuCores={cpuCores} isConnected={isConnected} />
        </Loading>
      </div>
    </div>
  );
}
