import { query } from "@solidjs/router";
import ContainerAPI from "./api";
import { formatContainerData } from "./mapper";
import { ComposeDTO } from "./types";

export const listContainersQuery = query(async (): Promise<ComposeDTO[]> => {
  "use server";
  const response = await ContainerAPI.listContainers();
  return formatContainerData(response?.responseBody);
}, "listContainers");
