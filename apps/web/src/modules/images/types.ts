export type { ImageDTO } from "../containers/types";

export interface FormattedImageDTO {
  id: string;
  name: string;
  tag: string;
  size: number;
  formattedSize: string;
  created: number;
  formattedCreated: string;
  containers: number;
  repoTags: string[];
  repoDigests: string[];
  labels: Record<string, string>;
}
