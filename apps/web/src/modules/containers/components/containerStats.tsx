import { createEffect, createSignal, Loading } from "solid-js";
import { StatPoint } from "../types";
import { CPUStats } from "./cpuStats";
import { MemoryStats } from "./memoryStats";
import { formatCPUStats, formatDiskIOStats, formatMemoryStats, formatNetworkStats } from "../mapper";
import { NetworkStats } from "./networkStats";
import { DiskIOStats } from "./diskIOStats";
import { PIdStats } from "./pidStats";
import { BASE_URL } from "../../../global/constants/network";

export default function ContainerStats(props: any) {
  const [stats, setStats] = createSignal<StatPoint[]>([]);
  const [cpuCores, setCpuCores] = createSignal<number>(0);
  const [currentPids, setCurrentPids] = createSignal(0);
  const [pidsLimit, setPidsLimit] = createSignal(0);
  const [_, setIsConnected] = createSignal(false);

  let previousDisk:
    | {
        read: number;
        write: number;
        time: number;
      }
    | undefined;

  let previousNetwork:
    | {
        rx: number;
        tx: number;
        time: number;
      }
    | undefined;

  createEffect(
    () => props.params?.id,
    (id: string) => {
      if (!id) return;

      // Reset stats and rate state on container change
      setStats([]);
      setIsConnected(false);
      setCpuCores(0);
      previousDisk = undefined;
      previousNetwork = undefined;

      let isDisposed = false;
      const es = new EventSource(`${BASE_URL}/containers/getContainerResourceUsageStatsById/${id}`);
      es.onopen = () => {
        if (!isDisposed) setIsConnected(true);
      };

      es.onmessage = (event) => {
        if (isDisposed || !event?.data) return;

        try {
          const data = JSON.parse(event.data);
          const memoryStats = formatMemoryStats(data);
          const cpuStats = formatCPUStats(data) as any;
          const networkStats = formatNetworkStats(data, previousNetwork);
          const diskIOStats = formatDiskIOStats(data, previousDisk);

          previousDisk = {
            read: diskIOStats.rawRead,
            write: diskIOStats.rawWrite,
            time: diskIOStats.time,
          };

          previousNetwork = {
            rx: networkStats.rawRx,
            tx: networkStats.rawTx,
            time: networkStats.time,
          };

          if (!cpuCores() && cpuStats?.numberCpus) {
            setCpuCores(cpuStats.numberCpus);
          }
          setCurrentPids(data.pids_stats?.current ?? 0);
          setPidsLimit(data.pids_stats?.limit ?? 0);

          const point: StatPoint = {
            time: data.read,
            cpu: {
              current: Number.isFinite(cpuStats?.cpuPercentage) ? cpuStats?.cpuPercentage : 0,
            },
            memory: memoryStats,
            network: {
              rxRate: networkStats.rxRate,
              txRate: networkStats.txRate,
            },
            disk: diskIOStats,
            pids: {
              currentPId: currentPids(),
              limit: pidsLimit(),
            },
          };

          setStats((prev) => {
            const next = [...prev, point];
            return next.length > 1000 ? next.slice(-1000) : next;
          });
        } catch (err) {
          console.error("Failed to parse container stats:", err);
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        es.close();
      };

      // Cleanup
      return () => {
        isDisposed = true;
        es.onmessage = null;
        es.onerror = null;
        es.onopen = null;
        es.close();
        setIsConnected(false);
        setStats([]);
        setCpuCores(0);
        previousDisk = undefined;
        previousNetwork = undefined;
      };
    }
  );

  return (
    <div class="rounded-md bg-[#0A0A0B] h-full overflow-y-auto">
      <div class="p-1 grid grid-cols-1 gap-2 items-start w-full min-w-0">
        <Loading fallback={<h1>CPU Stats loading...</h1>}>
          <CPUStats stats={stats()} cpuCores={cpuCores()} />
        </Loading>
        <Loading fallback={<h1>Memory Stats loading...</h1>}>
          <MemoryStats stats={stats()} />
        </Loading>
        <Loading fallback={<h1>PID Stats loading...</h1>}>
          <PIdStats stats={stats()} />
        </Loading>
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
