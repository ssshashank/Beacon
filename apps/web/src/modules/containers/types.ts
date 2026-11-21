import { ComposeStatus, ContainerKind, ContainerStatus } from "./constant";

export type ContainerKindType = typeof ContainerKind[keyof typeof ContainerKind];
export type ContainerStatusType = typeof ContainerStatus[keyof typeof ContainerStatus];
export type ComposeStatusType = typeof ComposeStatus[keyof typeof ComposeStatus];

export interface ComposeDTO {
  id: string;
  label: string
  containers?: ContainerDTO[];
  status?: ComposeStatusType;
  version?: string;
}

export interface ContainerDTO {
  id: string;
  name: string;
  image: string;
  status?: ContainerStatusType;
  kind?: ContainerKindType;
  labels?: any;
  ports?: PortMappingDTO[];
}

// Mirrors server/src/global/dto.rs ResponseBody<T>
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  body: T | null;
  error: { code: string; message: string } | null;
}

// Mirrors server/src/modules/images/dto.rs Image
export interface ImageDTO {
  id: string;
  name: string;
  tag?: string | null;
  architecture: string;
  os: string;
  local_digest?: string | null;
  size: number;
}

// Mirrors server/src/modules/containers/dto.rs PortMapping
export interface PortMappingDTO {
  host_ip?: string | null;
  host_port?: string | null;
  container_port: string;
  protocol: string;
}

// Mirrors server/src/modules/containers/dto.rs ContainerMountInfo
export interface ContainerMountDTO {
  source: string;
  destination: string;
  type?: string;
  mode?: string;
  rw?: boolean;
}

// Mirrors server/src/modules/containers/dto.rs Container
export interface ContainerDetailDTO {
  id: string;
  host_id?: string | null;
  group_id?: string | null;
  image_id: string;
  image: ImageDTO;
  name: string;
  tty: boolean;
  up_status: string;
  status: ContainerStatusType;
  volume?: string | null;
  label: Record<string, string>;
  command: string;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
  ports?: PortMappingDTO[];
  mounts?: ContainerMountDTO[];
  HostConfig?: any;
  Mounts?: any[];
}

// Mirrors server/src/modules/containers/dto.rs Process
export interface ProcessDTO {
  user_type: string;
  pid: string;
  ppid: string;
  cpu_utilization: string;
  start_time: string;
  teletypewriter: string;
  cummulative_cpu_time: string;
  cmd: string;
}

export interface StatPoint {
  time: string;
  cpu: {};
  memory?: {};
  network?: {
    rxRate: number;
    txRate: number;
  };
  disk?: {
    read: number;
    write: number;
  };
  pids?: {
    currentPId: number;
    limit: number;
  };
};

export interface ContainerLogsDTO {
  stream: string;
  message: string;
}
