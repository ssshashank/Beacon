import type { ImageDTO } from "../containers/types";
import type { FormattedImageDTO } from "./types";

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${val} ${sizes[i]}`;
}

export function formatTimeAgo(epochSeconds?: number | null): string {
  if (!epochSeconds) return "-";
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - epochSeconds);

  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function formatImageData(images: ImageDTO[]): FormattedImageDTO[] {
  return (images ?? []).map((img) => ({
    id: img.id,
    name: img.name || "<none>",
    tag: img.tag || "<none>",
    size: img.size || 0,
    formattedSize: formatBytes(img.size || 0),
    created: img.created || 0,
    formattedCreated: formatTimeAgo(img.created),
    containers: img.containers ?? -1,
    repoTags: img.repo_tags || [],
    repoDigests: img.repo_digests || [],
    labels: img.labels || {},
  }));
}
