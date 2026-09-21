import type { ComposeDTO, } from "./types";

export const formatContainerData = (rawData: any): ComposeDTO[] => {
  const composeMap = new Map<string, ComposeDTO>();

  for (const d of rawData ?? []) {
    const project = d?.Labels?.["com.docker.compose.project"] || d?.Labels?.["org.opencontainers.image.title"];
    if (!project) continue;

    if (!composeMap.has(project)) {
      composeMap.set(project, {
        id: d?.Labels?.["com.docker.compose.config-hash"] || d?.Labels?.["org.opencontainers.image.revision"],
        label: project,
        version: d?.Labels?.["com.docker.compose.version"] || d?.Labels?.["org.opencontainers.image.version"],
        containers: [],
        status: d?.State
      });
    }

    // Push containers
    composeMap.get(project)?.containers?.push({
      id: d?.Id,
      name: d?.Names?.[0]?.replace("/", ""),
      image: d?.Image,
      status: d?.State,
      labels: d?.Labels
    });
  }

  return Array.from(composeMap.values());
};

export const truncateLabel = (key: string, value: string) => {
  const shouldTruncate =
    key.includes("hash") ||
    key.includes("image") ||
    key.includes("config_files") ||
    key.includes("id") ||
    key.includes("revision");

  if (!shouldTruncate || value.length <= 24) {
    return value;
  }

  return `${value.slice(0, 12)}...${value.slice(-8)}`;
}

// Memory Stats Formatter
export function formatMemoryStats(data: any) {
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
export function formatCPUStats(data: any) {
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
    cpuPercentage, numberCpus
  };
}

// Network Stats Formatter
let prevRx = 0;
let prevTx = 0;
export function formatNetworkStats(data: any) {
  let rx = 0;
  let tx = 0;
  if (data?.networks) {
    for (const iface of Object.values<any>(data.networks)) {
      rx += iface?.rx_bytes ?? 0;
      tx += iface?.tx_bytes ?? 0;
    }
  }
  const rxKBps = prevRx > 0 ? (rx - prevRx) / 1024 : 0;
  const txKBps = prevTx > 0 ? (tx - prevTx) / 1024 : 0;

  prevRx = rx;
  prevTx = tx;

  return {
    rxKBps: Math.round(rxKBps),
    txKBps: Math.round(txKBps)
  };
};

// Disk io stats Formatter
export function formatDiskIOStats( data: any, previous?: { read: number; write: number; time: number; } ) {
  const current = getDiskCounters(data);
  const time = new Date(data.read).getTime();

  if (!previous) {
    return {
      read: 0,
      write: 0,
      rawRead: current.read,
      rawWrite: current.write,
      time,
    };
  }

  const elapsed = (time - previous.time) / 1000;

  if (elapsed <= 0) {
    return {
      read: 0,
      write: 0,
      rawRead: current.read,
      rawWrite: current.write,
      time,
    };
  }

  return {
    read: Math.max(0, current.read - previous.read) / elapsed,
    write: Math.max(0, current.write - previous.write) / elapsed,
    rawRead: current.read,
    rawWrite: current.write,
    time,
  };
}

function getDiskCounters(data: any) {
  let read = 0;
  let write = 0;

  const entries = data?.blkio_stats?.io_service_bytes_recursive;

  if (!Array.isArray(entries)) {
    return { read: 0, write: 0 };
  }

  for (const entry of entries) {
    const value = Number(entry?.value ?? 0);

    if (!Number.isFinite(value)) continue;

    if (entry?.op?.toLowerCase() === "read") {
      read += value;
    }

    if (entry?.op?.toLowerCase() === "write") {
      write += value;
    }
  }

  return { read, write };
}
