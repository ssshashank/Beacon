import { createEffect, createSignal, For, Loading, Show } from "solid-js";
import { FilesIcon } from "../../../global/components/_icons/files";
import { ChevronRightIcon } from "../../../global/components/_icons/chevronRight";
import { ChevronDownIcon } from "../../../global/components/_icons/chevronDown";
import ExecAPI from "../../exec/api";
import ExecStreamAPI from "../../exec/stream";
import ContainerStream from "../stream";
import { ExecDTO } from "../../exec/dto";

interface FileTreeRowProps {
  item: ExecDTO;
  parentPath: string;
  containerId: string;
  level: number;
}

// Smart loader: tries Exec first (ls -la); falls back to Archive stream if distroless/failed
function fetchDirectory(
  containerId: string,
  path: string,
  onItem: (item: ExecDTO) => void,
  onDone: () => void
): () => void {
  let isClosed = false;
  let hasItems = false;
  let activeEs: EventSource | null = null;

  const closeActive = () => {
    if (activeEs) {
      activeEs.onmessage = null;
      activeEs.onerror = null;
      activeEs.close();
      activeEs = null;
    }
  };

  const startArchiveStream = () => {
    if (isClosed) return;
    try {
      const es = ContainerStream.streamFileSystem(containerId, path);
      activeEs = es;

      es.onmessage = (event) => {
        if (isClosed || !event?.data) return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === "end" || parsed.status === "completed") {
            closeActive();
            onDone();
            return;
          }
          const name = parsed.name?.trim();
          if (!name || name === "." || name === ".." || name.includes("root root")) return;
          hasItems = true;
          onItem(parsed as ExecDTO);
        } catch {}
      };

      es.addEventListener("end", () => {
        closeActive();
        onDone();
      });

      es.onerror = () => {
        closeActive();
        onDone();
      };
    } catch {
      onDone();
    }
  };

  // 1. Try Exec first (ls -la)
  ExecAPI.createAnExecByContainerID(containerId, path)
    .then((res: any) => {
      if (isClosed) return;
      // Extract Docker Exec Id correctly from responseBody
      const execId =
        res?.responseBody?.body?.Id ||
        res?.responseBody?.Id ||
        res?.body?.Id ||
        res?.data?.Id;

      if (!execId) {
        startArchiveStream();
        return;
      }

      const es = ExecStreamAPI.createAnExec(execId);
      activeEs = es;

      es.onmessage = (event) => {
        if (isClosed || !event?.data) return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === "end" || parsed.status === "completed") {
            closeActive();
            if (!hasItems) {
              // Exec returned nothing (e.g. distroless without ls) -> fallback to archive
              startArchiveStream();
            } else {
              onDone();
            }
            return;
          }
          const name = parsed.name?.trim();
          if (!name || name === "." || name === ".." || name.includes("root root")) return;
          hasItems = true;
          onItem(parsed as ExecDTO);
        } catch {}
      };

      es.addEventListener("end", () => {
        closeActive();
        if (!hasItems) {
          startArchiveStream();
        } else {
          onDone();
        }
      });

      es.onerror = () => {
        closeActive();
        if (!hasItems) {
          startArchiveStream();
        } else {
          onDone();
        }
      };
    })
    .catch(() => {
      if (!isClosed) {
        startArchiveStream();
      }
    });

  return () => {
    isClosed = true;
    closeActive();
  };
}

function FileTreeRow(props: FileTreeRowProps) {
  const [isExpanded, setIsExpanded] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [children, setChildren] = createSignal<ExecDTO[]>([]);

  const fullPath = () => {
    return props.parentPath === "/"
      ? `/${props.item.name}`
      : `${props.parentPath}/${props.item.name}`;
  };

  const isFolder = () => props.item.kind === "Folder";

  const handleToggle = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!isFolder()) return;

    if (isExpanded()) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);

    if (children().length > 0) {
      return;
    }

    setIsLoading(true);
    const accumulated: ExecDTO[] = [];
    fetchDirectory(
      props.containerId,
      fullPath(),
      (item) => {
        accumulated.push(item);
        setChildren([...accumulated]);
      },
      () => {
        setChildren([...accumulated]);
        setIsLoading(false);
      }
    );
  };

  return (
    <>
      <tr
        class={`border-b-[0.03px] border-neutral-800/60 hover:bg-[#1a1b1f] transition-colors select-none ${
          isFolder() ? "cursor-pointer" : ""
        }`}
        onClick={handleToggle}
      >
        <td
          class="py-2 pr-4 flex items-center gap-2"
          style={{ "padding-left": `${props.level * 18 + 8}px` }}
        >
          {/* Chevron or placeholder */}
          <span class="w-3.5 flex items-center justify-center shrink-0">
            <Show
              when={isFolder()}
              fallback={<span class="w-3.5 inline-block" />}
            >
              <Show
                when={!isLoading()}
                fallback={
                  <span class="w-2.5 h-2.5 border border-neutral-500 border-t-transparent rounded-full animate-spin inline-block" />
                }
              >
                {isExpanded() ? (
                  <ChevronDownIcon size={12} color="#9ca3af" />
                ) : (
                  <ChevronRightIcon size={12} color="#6b7280" />
                )}
              </Show>
            </Show>
          </span>

          {/* Folder / File Icon */}
          {isFolder() ? (
            <svg
              class="w-4 h-4 text-blue-400 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          ) : (
            <svg
              class="w-4 h-4 text-neutral-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          )}

          <span
            class={`font-mono text-xs ${
              isFolder() ? "text-neutral-100 font-medium" : "text-neutral-300"
            }`}
          >
            {props.item.name}
          </span>
        </td>

        <td class="py-2 pr-4 text-neutral-400 text-xs whitespace-nowrap">
          {props.item.modified_date || "-"}
        </td>
        <td class="py-2 pr-4 text-neutral-400 text-xs whitespace-nowrap">
          {props.item.size || "-"}
        </td>
        <td class="py-2 text-neutral-400 text-xs whitespace-nowrap">
          {props.item.kind || "-"}
        </td>
      </tr>

      {/* Recursive Children Rows */}
      <Show when={isExpanded()}>
        <Show
          when={!isLoading() || children().length > 0}
          fallback={
            <tr>
              <td
                colspan={4}
                class="py-1 text-neutral-500 text-xs italic"
                style={{ "padding-left": `${(props.level + 1) * 18 + 8}px` }}
              >
                Loading...
              </td>
            </tr>
          }
        >
          <For
            each={children()}
            fallback={
              <tr>
                <td
                  colspan={4}
                  class="py-1 text-neutral-500 text-xs italic"
                  style={{ "padding-left": `${(props.level + 1) * 18 + 8}px` }}
                >
                  Empty folder
                </td>
              </tr>
            }
          >
            {(child) => (
              <FileTreeRow
                item={child}
                parentPath={fullPath()}
                containerId={props.containerId}
                level={props.level + 1}
              />
            )}
          </For>
        </Show>
      </Show>
    </>
  );
}

export default function ContainerFiles(props: any) {
  const [files, setFiles] = createSignal<ExecDTO[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);

  createEffect(
    () => props?.params?.id,
    (id: string) => {
      if (!id) return;
      setFiles([]);
      setIsLoading(true);

      const accumulated: ExecDTO[] = [];
      const cancel = fetchDirectory(
        id,
        "/",
        (item) => {
          accumulated.push(item);
          setFiles([...accumulated]);
        },
        () => {
          setFiles([...accumulated]);
          setIsLoading(false);
        }
      );

      // Cleanup
      return () => {
        cancel();
        setFiles([]);
      };
    }
  );

  return (
    <div class="rounded-md bg-[#0A0A0B] h-full overflow-y-auto">
      <div class="p-1">
        <div class="h-fit rounded bg-[#151619] p-3">
          <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
            <FilesIcon size={14} color="#FED703" />
            <span class="text-md font-medium">Files</span>
          </div>

          <Show
            when={!isLoading()}
            fallback={
              <p class="text-sm text-gray-500 py-4 text-center">Loading files...</p>
            }
          >
            <Show
              when={files().length > 0}
              fallback={
                <p class="text-sm text-gray-500 py-4 text-center">No files found</p>
              }
            >
              <div class="overflow-x-auto pt-2">
                <table class="w-full text-sm text-gray-200">
                  <thead>
                    <tr class="text-neutral-400 text-left border-b-[0.03px] border-neutral-700 text-xs">
                      <th class="py-2 pr-4 font-normal">Name</th>
                      <th class="py-2 pr-4 font-normal">Date Modified</th>
                      <th class="py-2 pr-4 font-normal">Size</th>
                      <th class="py-2 pr-4 font-normal">Kind</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={files()}>
                      {(item) => (
                        <FileTreeRow
                          item={item}
                          parentPath="/"
                          containerId={props?.params?.id}
                          level={0}
                        />
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
}
