import { query } from "@solidjs/router";
import NetworksAPI from "./api";
import { ApiResponse } from "../containers/types";
import type { NetworkDTO, NetworkInspectDTO } from "./types";

export const listNetworksQuery = query(async (): Promise<NetworkDTO[]> => {
  const response = await NetworksAPI.listNetworks();
  const body = (response?.responseBody as ApiResponse<NetworkDTO[]>)?.body;
  return Array.isArray(body) ? body : [];
}, "listNetworks");

export const inspectNetworkByIDQuery = query(async (id: string): Promise<NetworkInspectDTO | null> => {
  if (!id) return null;
  const response = await NetworksAPI.inspectNetworkByID(id);
  const rb: any = response?.responseBody;
  return rb?.body ?? rb ?? null;
}, "inspectNetworkById");
