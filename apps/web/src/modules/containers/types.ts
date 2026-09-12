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
}
