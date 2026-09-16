"use server";
import { ApiFactory } from "../../global/services/http";
import type { HttpResponse } from "../../global/constants/network";

const ContainerAPI = {
  listContainers: async () => ApiFactory.get<HttpResponse>("/containers/getAllContainers"),
  inspectContainerByID: async(id:string) => ApiFactory.get<HttpResponse>(`/containers/inspectContainer/${id}`),
  getAllProcessRunningInContainer: async(id:string) => ApiFactory.get(`/containers/allProcessRunningInContainer/${id}`),
  getContainerLogsByID: async(id: string) => ApiFactory.get(`/containers/getContainerLogs/${id}`),
  getChangesOnFileSystem: async (id:string) => ApiFactory.get(`/containers/getChangesOnContainerFileSystemById/${id}`),
  exportAContainer: async(id: string) => ApiFactory.get(`/containers/exportContainerById/${id}`),
  getContainersResoureceUsageStats: async(id: string) => ApiFactory.get(`/containers/getContainerResourceUsageStatsById/${id}`)
};

export default ContainerAPI;
