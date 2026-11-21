"use server";
import { ApiFactory } from "../../global/services/http";
import { type HttpResponse } from "../../global/constants/network";

const ContainerAPI = {
  listContainers: async () => ApiFactory.get<HttpResponse>("/containers/getAllContainers"),
  inspectContainerByID: async (id: string) => ApiFactory.get<HttpResponse>(`/containers/inspectContainer/${id}`),
  getAllProcessRunningInContainer: async (id: string) => ApiFactory.get<HttpResponse>(`/containers/allProcessRunningInContainer/${id}`),
  getChangesOnFileSystem: async (id: string) => ApiFactory.get(`/containers/getChangesOnContainerFileSystemById/${id}`),
  exportAContainer: async (id: string) => ApiFactory.get(`/containers/exportContainerById/${id}`),
  getContainersResoureceUsageStats: async (id: string) => ApiFactory.get(`/containers/getContainerResourceUsageStatsById/${id}`),
  startContainer: async (id: string) => ApiFactory.post<HttpResponse>(`/containers/start/${id}`),
  stopContainer: async (id: string) => ApiFactory.post<HttpResponse>(`/containers/stop/${id}`),
  restartContainer: async (id: string) => ApiFactory.post<HttpResponse>(`/containers/restart/${id}`),
  deleteContainer: async (id: string) => ApiFactory.delete<HttpResponse>(`/containers/delete/${id}`)
};

export default ContainerAPI;
