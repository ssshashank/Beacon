import { query } from "@solidjs/router";
import ContainerAPI from "./api";
import { formatContainerData } from "./mapper";
import { ApiResponse, ComposeDTO, ContainerDetailDTO, ProcessDTO } from "./types";

export const listContainersQuery = query(async (): Promise<ComposeDTO[]> => {
  const response = await ContainerAPI.listContainers();
  const body = (response?.responseBody as ApiResponse<ContainerDetailDTO[]>)?.body;
  return formatContainerData(body ?? []);
}, "listContainers");

export const inspectContainerByIDQuery = query(async (id: string): Promise<ContainerDetailDTO | null> => {
  const response = await ContainerAPI.inspectContainerByID(id);
  return (response?.responseBody as ApiResponse<ContainerDetailDTO>)?.body ?? null;
}, 'inspectContainer');

export const getAllProcessRunningInContainerQuery = query(async (id: string): Promise<ProcessDTO[]> => {
  const response = await ContainerAPI.getAllProcessRunningInContainer(id);
  return (response?.responseBody as ApiResponse<ProcessDTO[]>)?.body ?? [];
}, 'allProcessRunning');

export const getChangesOnFileSystemQuery = query(async (id: string): Promise<any> => {
  const response = await ContainerAPI.getChangesOnFileSystem(id);
  return response.responseBody;
}, 'fileSystemChanges');

export const exportAContainerQuery = query(async (id: string): Promise<any> => {
  const response = await ContainerAPI.exportAContainer(id);
  return response.responseBody;
}, 'exportAContainer');

export const getContainerResourceUsageStatsQuery = query(async (id: string): Promise<any> => {
  const response = await ContainerAPI.getContainersResoureceUsageStats(id);
  return response.responseBody;
}, 'containerResourceUsageStats')
