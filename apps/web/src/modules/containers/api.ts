"use server";
import { ApiFactory } from "../../global/services/http";
import type { HttpResponse } from "../../global/constants/network";

const ContainerAPI = {
  listContainers: async (data?: unknown) => ApiFactory.get<HttpResponse>("http://localhost:8000/api/v1/containers/getAllContainers")
};

export default ContainerAPI;
