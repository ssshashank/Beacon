import { query } from "@solidjs/router";
import ImagesAPI from "./api";
import { ApiResponse } from "../containers/types";

export const listImagesQuery= query(async (): Promise<any> => {
  const response = await ImagesAPI.listImages();
  const body = (response?.responseBody as ApiResponse<any>)?.body;
  return body;
}, "listImages");

export const inspectImageByIDQuery = query(async (id: string): Promise<any> => {
  if (!id) return null;
  const response = await ImagesAPI.inspectImageByID(id);
  const rb: any = response?.responseBody;
  return rb?.body ?? rb ?? null;
}, "inspectImageById");

export const getImageHistoryByIDQuery = query(async (id: string): Promise<any[]> => {
  if (!id) return [];
  const response = await ImagesAPI.getImageHistoryByID(id);
  const data: any = response?.responseBody;
  const list = data?.body ?? data;
  return Array.isArray(list) ? list : [];
}, "getImageHistoryById");

