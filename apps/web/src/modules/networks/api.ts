"use server";
import { ApiFactory } from "../../global/services/http";
import { type HttpResponse } from "../../global/constants/network";

const NetworksAPI = {
  listNetworks: async () => ApiFactory.get<HttpResponse>("/networks/getAllNetworks"),
  inspectNetworkByID: async (id: string) =>
    ApiFactory.get<HttpResponse>(`/networks/inspectNetwork/${encodeURIComponent(id)}`),
  deleteNetworkByID: async (id: string) =>
    ApiFactory.delete<HttpResponse>(`/networks/delete/${encodeURIComponent(id)}`),
};

export default NetworksAPI;
