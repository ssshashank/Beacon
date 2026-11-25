"use server";
import { ApiFactory } from "../../global/services/http";
import { type HttpResponse } from "../../global/constants/network";

const VolumesAPI = {
  listVolumes: async () => ApiFactory.get<HttpResponse>("/volumes/getAllVolumes"),
  inspectVolumeByName: async (name: string) =>
    ApiFactory.get<HttpResponse>(`/volumes/inspectVolume/${encodeURIComponent(name)}`),
  deleteVolumeByName: async (name: string) =>
    ApiFactory.delete<HttpResponse>(`/volumes/delete/${encodeURIComponent(name)}`),
};

export default VolumesAPI;
