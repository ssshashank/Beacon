import type { ComposeDTO, ContainerDetailDTO } from "./types";

export const formatContainerData = (containers: ContainerDetailDTO[]): ComposeDTO[] => {
  const composeMap = new Map<string, ComposeDTO>();

  for (const d of containers ?? []) {
    const project = d?.label?.["com.docker.compose.project"] || d?.label?.["org.opencontainers.image.title"];
    if (!project) continue;

    if (!composeMap.has(project)) {
      composeMap.set(project, {
        id: d?.label?.["com.docker.compose.config-hash"] || d?.label?.["org.opencontainers.image.revision"],
        label: project,
        version: d?.label?.["com.docker.compose.version"] || d?.label?.["org.opencontainers.image.version"],
        containers: [],
        status: d?.status
      });
    }

    // Push containers
    composeMap.get(project)?.containers?.push({
      id: d?.id,
      name: d?.name?.replace("/", ""),
      image: d?.image?.name,
      status: d?.status,
      labels: d?.label,
      ports: d?.ports
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
    memoryUsagePercentage: Number.isFinite(memoryUsagePercentage) ? memoryUsagePercentage : 0
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
export function formatNetworkStats(
  data: any,
  previous?: { rx: number; tx: number; time: number }
) {
  let rx = 0;
  let tx = 0;
  if (data?.networks) {
    for (const iface of Object.values<any>(data.networks)) {
      rx += iface?.rx_bytes ?? 0;
      tx += iface?.tx_bytes ?? 0;
    }
  }

  const time = new Date(data.read).getTime();

  if (!previous) {
    return {
      rxRate: 0,
      txRate: 0,
      rawRx: rx,
      rawTx: tx,
      time,
    };
  }

  const elapsed = Math.max(0.001, (time - previous.time) / 1000);

  return {
    rxRate: Math.max(0, (rx - previous.rx) / elapsed),
    txRate: Math.max(0, (tx - previous.tx) / elapsed),
    rawRx: rx,
    rawTx: tx,
    time,
  };
}

// Disk io stats Formatter
export function formatDiskIOStats(data: any, previous?: { read: number; write: number; time: number; }) {
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

  const entries =
    data?.blkio_stats?.io_service_bytes_recursive ??
    data?.blkio_stats?.io_serviced_recursive;

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

export function formatRate(bytesPerSecond: number) {
  if (!bytesPerSecond || bytesPerSecond <= 0) return "0 B/s";

  const kb = bytesPerSecond / 1024;
  if (kb < 1) return `${bytesPerSecond.toFixed(0)} B/s`;

  const mb = kb / 1024;
  if (mb < 1) return `${kb.toFixed(1)} KB/s`;

  const gb = mb / 1024;
  if (gb < 1) return `${mb.toFixed(1)} MB/s`;

  return `${gb.toFixed(2)} GB/s`;
};

export function formatBytes(bytes: number) {
  if (!bytes || bytes <= 0) return "0 B";

  const kb = bytes / 1024;
  if (kb < 1) return `${bytes.toFixed(0)} B`;

  const mb = kb / 1024;
  if (mb < 1) return `${kb.toFixed(1)} KB`;

  const gb = mb / 1024;
  if (gb < 1) return `${mb.toFixed(1)} MB`;

  return `${gb.toFixed(2)} GB`;
};


export function formatStreamByte(bytes: number) {
  if (!bytes || bytes <= 0) return 0;

  const kb = bytes / 1024;
  if (kb < 1) return bytes.toFixed(0);

  const mb = kb / 1024;
  if (mb < 1) return kb.toFixed(1);

  const gb = mb / 1024;
  if (gb < 1) return mb.toFixed(1);

  return gb.toFixed(2);
};
