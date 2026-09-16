import type { ComposeDTO, } from "./types";

export const formatContainerData = (rawData: any): ComposeDTO[] => {
  const composeMap = new Map<string, ComposeDTO>();

  for (const d of rawData ?? []) {
    const project = d?.Labels?.["com.docker.compose.project"] || d?.Labels?.["org.opencontainers.image.title"];

    if (!project) continue;

    if (!composeMap.has(project)) {
      composeMap.set(project, {
        id: d?.Labels?.["com.docker.compose.config-hash"] || d?.Labels?.["org.opencontainers.image.revision"],
        label: project,
        version: d?.Labels?.["com.docker.compose.version"] || d?.Labels?.["org.opencontainers.image.version"],
        containers: [],
      });
    }

    // Push containers
    composeMap.get(project)?.containers?.push({
      id: d?.Id,
      name: d?.Names?.[0]?.replace("/", ""),
      image: d?.Image,
      status: d?.State,
      labels: d?.Labels
    });
  }

  return Array.from(composeMap.values());
};


export const truncateLabel = (key: string, value: string) => {
  const shouldTruncate =
    key.includes("hash") ||
    key.includes("image") ||
    key.includes("config_files")||
    key.includes("id") ||
    key.includes("revision");

  if (!shouldTruncate || value.length <= 24) {
    return value;
  }

  return `${value.slice(0, 12)}...${value.slice(-8)}`;
}
