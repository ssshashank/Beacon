"use server";
import { ApiFactory } from "../../global/services/http";
import { type HttpResponse } from "../../global/constants/network";

const ImagesAPI = {
  listImages: async () => ApiFactory.get<HttpResponse>("/images/getAllImages"),
  inspectImageByID: async (id: string) => ApiFactory.get<HttpResponse>(`/images/inspectImage/${id}`),
  getImageHistoryByID: async (id: string) => ApiFactory.get<HttpResponse>(`/images/getImageHistory/${id}`),
  deleteImage: async (id: string) => ApiFactory.delete<HttpResponse>(`/images/delete/${id}`),
  exportImageByID: async (id: string) => ApiFactory.get<HttpResponse>(`/images/exportImageById/${id}`),
};

export default ImagesAPI;
