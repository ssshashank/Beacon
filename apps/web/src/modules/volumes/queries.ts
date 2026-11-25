import { query } from "@solidjs/router";
import VolumesAPI from "./api";
import { ApiResponse } from "../containers/types";
import type { VolumeDTO, VolumeInspectDTO } from "./types";

export const listVolumesQuery = query(async (): Promise<VolumeDTO[]> => {
  const response = await VolumesAPI.listVolumes();
  const body = (response?.responseBody as ApiResponse<VolumeDTO[]>)?.body;
  return Array.isArray(body) ? body : [];
}, "listVolumes");

export const inspectVolumeByNameQuery = query(async (name: string): Promise<VolumeInspectDTO | null> => {
  if (!name) return null;
  const response = await VolumesAPI.inspectVolumeByName(name);
  const rb: any = response?.responseBody;
  return rb?.body ?? rb ?? null;
}, "inspectVolumeByName");
