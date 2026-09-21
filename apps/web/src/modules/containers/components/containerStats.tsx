import { createEffect, createMemo, createSignal, Loading } from "solid-js";
import { BASE_URL } from "../../../global/constants/network";
import { StatPoint } from "../types";
import { CPUStats } from "./cpuStats";
import { MemoryStats } from "./memoryStats";
import { formatCPUStats, formatDiskIOStats, formatMemoryStats, formatNetworkStats } from "../mapper";
import { NetworkStats } from "./networkStats";
import { DiskIOStats } from "./diskIOStats";

export default function ContainerStats(props: any) {
  const [stats, setStats] = createSignal<StatPoint[]>([]);
  const [cpuCores, setCpuCores] = createSignal<number>(0);
  const [currentPids, setCurrentPids] = createSignal(0);
  const [pidsLimit, setPidsLimit] = createSignal(0);
  const [isConnected, setIsConnected] = createSignal(false);
  let previousDisk: | {
    read: number;
    write: number;
    time: number;
  } | undefined;

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
        const networkStats = formatNetworkStats(data);
        const diskIOStats = formatDiskIOStats(data, previousDisk);

        previousDisk = {
          read: diskIOStats.rawRead,
          write: diskIOStats.rawWrite,
          time: diskIOStats.time,
        };

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
          memory: memoryStats,
          network: networkStats,
          disk: diskIOStats
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
      <div class="p-1 grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 gap-y-2">
        <Loading fallback={<h1>Network Stats loading...</h1>}>
          <NetworkStats stats={stats()} />
        </Loading>
        <Loading fallback={<h1>DiskIO Stats loading...</h1>}>
          <DiskIOStats stats={stats()} />
        </Loading>
      </div>
    </div>
  );
}
