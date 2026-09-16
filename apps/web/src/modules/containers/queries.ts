import { query } from "@solidjs/router";
import ContainerAPI from "./api";
import { formatContainerData } from "./mapper";
import { ComposeDTO } from "./types";

export const listContainersQuery = query(async (): Promise<ComposeDTO[]> => {
  const response = await ContainerAPI.listContainers();
  return formatContainerData(response?.responseBody);
}, "listContainers");

export const inspectContainerByIDQuery = query(async (id: string): Promise<any> => {
  const response = await ContainerAPI.inspectContainerByID(id);
  return response.responseBody;
}, 'inspectContainer');

export const getAllProcessRunningInContainerQuery = query(async (id: string) => {
  const response = await ContainerAPI.getAllProcessRunningInContainer(id);
  return response?.responseBody;
}, 'allProcessRunning');

export const getContainerLogsQuery = query(async (id: string): Promise<any> => {
  const response = await ContainerAPI.getContainerLogsByID(id);
  return response.responseBody;
}, "containerLogs");

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
