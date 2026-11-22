import { createEffect, createSignal, For, Show } from "solid-js";
import ContainerStream from "../stream";
import { ContainerLogsDTO } from "../types";

type LogLevel = "error" | "warn" | "notice" | "info" | "default";

interface ParsedLogLine {
  stream: string;
  timestamp: string;
  message: string;
  level: LogLevel;
}

function formatTimestamp(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch {
    return "";
  }
}

function getLogLevel(message: string, stream: string): LogLevel {
  const lower = message.toLowerCase();
  if (
    stream === "stderr" ||
    lower.includes("[error]") ||
    lower.includes(" error ") ||
    lower.includes(" err ") ||
    lower.includes("fatal") ||
    lower.includes("panic") ||
    lower.startsWith("error:")
  ) {
    return "error";
  }
  if (
    lower.includes("[warning]") ||
    lower.includes("[warn]") ||
    lower.includes(" warning ") ||
    lower.includes(" warn ") ||
    lower.startsWith("warn:") ||
    lower.startsWith("warning:")
  ) {
    return "warn";
  }
  if (lower.includes("[notice]") || lower.includes(" notice ")) {
    return "notice";
  }
  if (lower.includes("[info]") || lower.includes(" info ")) {
    return "info";
  }
  return "default";
}

function parseLogLine(raw: string, stream: string): ParsedLogLine {
  // Docker logs RFC3339 timestamp: e.g. 2026-11-20T07:49:29.212140000Z
  const rfcMatch = raw.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)\s+(.*)$/);
  let timestamp = "";
  let message = raw;

  if (rfcMatch) {
    timestamp = formatTimestamp(rfcMatch[1]);
    message = rfcMatch[2];
  } else {
    // If the message itself starts with an ISO/app timestamp
    const logDateMatch = raw.match(/^(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:[+-]\d{2}:\d{2})?)/);
    if (logDateMatch) {
      timestamp = formatTimestamp(logDateMatch[1]);
    }
  }

  const level = getLogLevel(message, stream);
  return { stream, timestamp, message, level };
}

function getBarColor(level: LogLevel): string {
  switch (level) {
    case "error":
      return "bg-[#ef4444]";
    case "warn":
      return "bg-[#f59e0b]";
    case "notice":
      return "bg-[#06b6d4]";
    case "info":
      return "bg-[#10b981]";
    default:
      return "bg-neutral-700";
  }
}

function getTextColor(level: LogLevel): string {
  switch (level) {
    case "error":
      return "text-[#f87171]";
    case "warn":
      return "text-[#fbbf24]";
    case "notice":
      return "text-[#22d3ee]";
    case "info":
      return "text-neutral-200";
    default:
      return "text-neutral-300";
  }
}

export default function ContainerLogs(props: any) {
  const [logs, setLogs] = createSignal<ContainerLogsDTO[]>([]);
  const [isAtBottom, setIsAtBottom] = createSignal(true);
  let containerRef: HTMLDivElement | any = undefined;

  const scrollToBottom = () => {
    if (containerRef) {
      containerRef.scrollTop = containerRef?.scrollHeight;
    }
  };

  const handleScroll = (e: Event) => {
    const target = e.currentTarget as HTMLDivElement;
    // Consider user "at bottom" if within 60px of the end
    const atBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 60;
    setIsAtBottom(atBottom);
  };

  createEffect(
    () => props.params?.id,
    (id: string) => {
      if (!id) return;

      // Reset logs and scroll state immediately when container ID changes
      setLogs([]);
      setIsAtBottom(true);

      let isDisposed = false;
      const es: EventSource = ContainerStream.streamContainerLogs(id);

      es.onmessage = (event) => {
        if (isDisposed || !event?.data) return;
        try {
          let parsed: ContainerLogsDTO;
          if (typeof event.data === "string" && event.data.startsWith("{")) {
            parsed = JSON.parse(event.data);
          } else {
            parsed = { stream: "stdout", message: event.data };
          }
          setLogs((prev) => [...prev, parsed]);
        } catch {
          setLogs((prev) => [...prev, { stream: "stdout", message: event.data }]);
        }
      };

      es.onerror = () => {
        es.close();
      };

      // Cleanup
      return () => {
        isDisposed = true;
        es.onmessage = null;
        es.onerror = null;
        es.close();
        setLogs([]);
        setIsAtBottom(true);
      };
    }
  );

  // Auto-scroll to bottom whenever new logs arrive (if user hasn't scrolled up)
  createEffect(
    () => logs().length,
    () => {
      if (isAtBottom()) {
        requestAnimationFrame(() => {
          if (isAtBottom()) {
            scrollToBottom();
          }
        });
      }
    }
  );

  return (
    <div class="relative h-full">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        class="rounded-md bg-[#0A0A0B] h-full p-3 overflow-y-auto space-y-0.5 font-mono text-xs text-gray-300 select-text"
      >
        <For each={logs()} fallback={<div class="text-neutral-500 p-2 text-center text-xs">No logs found</div>}>
          {(item, index) => {
            const parsed = parseLogLine(item.message, item.stream);
            return (
              <div class="flex items-start hover:bg-neutral-900/60 py-0.5 px-2 rounded leading-5 group transition-colors">
                {/* Index Number */}
                <span class="text-neutral-600 select-none text-[11px] w-9 text-right shrink-0 tabular-nums pr-2">
                  {index() + 1}.
                </span>

                {/* Left Column: Stream & Timestamp */}
                <div class="flex items-center gap-2 w-48 shrink-0 select-none text-[11px]">
                  <span
                    class={`font-semibold tracking-wider ${
                      parsed.stream === "stderr" ? "text-red-400" : "text-sky-400"
                    }`}
                  >
                    {(parsed.stream || "stdout").toUpperCase()}
                  </span>
                  <span class="text-neutral-500 tabular-nums">
                    {parsed.timestamp}
                  </span>
                </div>

                {/* Vertical Divider Bar */}
                <div
                  class={`w-[2px] self-stretch min-h-[18px] mx-2 shrink-0 rounded-full ${getBarColor(
                    parsed.level
                  )}`}
                />

                {/* Right Column: Log Message */}
                <div class={`break-all whitespace-pre-wrap flex-1 ${getTextColor(parsed.level)}`}>
                  {parsed.message}
                </div>
              </div>
            );
          }}
        </For>
      </div>

      <Show when={!isAtBottom() && logs().length > 0}>
        <button
          onClick={() => {
            scrollToBottom();
            setIsAtBottom(true);
          }}
          class="absolute bottom-4 right-6 bg-olive-600 hover:bg-neutral-800 text-neutral-300 text-xs px-3 py-1.5 rounded-md shadow-lg border border-neutral-700 flex items-center gap-1.5 transition-all cursor-pointer">
          <span>↓ Jump to latest</span>
        </button>
      </Show>
    </div>
  );
}
