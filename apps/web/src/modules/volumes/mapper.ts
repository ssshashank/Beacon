import { formatBytes } from "../images/mapper";

export { formatBytes };

export function formatVolumeCreatedAt(raw?: string | null): string {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return String(raw);

  const now = Date.now();
  const diffSec = Math.floor((now - d.getTime()) / 1000);
  let rel = "just now";
  if (diffSec >= 60) {
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) {
      rel = `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
    } else {
      const hours = Math.floor(mins / 60);
      if (hours < 24) {
        rel = `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
      } else {
        const days = Math.floor(hours / 24);
        rel = `${days} ${days === 1 ? "day" : "days"} ago`;
      }
    }
  }

  const formatted = d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return `${rel} (${formatted})`;
}

export function formatTimeAgoString(raw?: string | null): string {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "-";

  const diff = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
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
