import { createEffect, createMemo, createSignal, For, Loading, Show } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { listContainersQuery } from "../queries";
import ContainerAPI from "../api";
import EventStream from "../../events/stream";
import { createBGColorGenerator } from "../../../global/reactivity/createBgColor";
import { LayersIcon } from "../../../global/components/_icons/layers";
import { BoxIcons } from "../../../global/components/_icons/box";
import { PlayIcon } from "../../../global/components/_icons/play";
import { StopIcon } from "../../../global/components/_icons/stop";
import { TrashIcon } from "../../../global/components/_icons/trash";
import { LinkIcon } from "../../../global/components/_icons/link";
import { Accordion, AccordionItem } from "../../../global/components/_common/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../global/components/_common/tabs";
import { ContainerStatus } from "../constant";
import type { ComposeDTO, ContainerDTO, PortMappingDTO } from "../types";
import allContainersSvg from "~/assets/_svgs/allContainers.svg";
import activeContainersSvg from "~/assets/_svgs/activeContainers.svg";
import { isSidebarRouteActive } from "../../../global/utils/route";
import { StatusDot } from "../../../global/components/_common/statusDot";

function Spinner(props: { size?: number }) {
  const s = props.size ?? 13;
  return (
    <svg class="animate-spin text-neutral-400" width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function ComposeList(props: {
  composes: ComposeDTO[];
  emptyIcon: string;
  emptyMessage: string;
  loadingContainerIds: Record<string, boolean>;
  loadingComposeIds: Record<string, boolean>;
  onStart: (e: MouseEvent, id: string) => void;
  onStop: (e: MouseEvent, id: string) => void;
  onDelete: (e: MouseEvent, id: string, name: string) => void;
  onStartGroup: (e: MouseEvent, compose: ComposeDTO) => void;
  onStopGroup: (e: MouseEvent, compose: ComposeDTO) => void;
  onDeleteGroup: (e: MouseEvent, compose: ComposeDTO) => void;
}) {
  const location = useLocation();
  const isActiveRoute = (path: string) => isSidebarRouteActive(location.pathname, path);
  const navigate = useNavigate();

  const handleOpenPort = (e: MouseEvent, ports?: PortMappingDTO[]) => {
    e.stopPropagation();
    if (!ports || ports.length === 0) return;
    const mapped = ports.find((p) => p.host_port);
    if (mapped?.host_port) {
      const host = mapped.host_ip && mapped.host_ip !== "0.0.0.0" ? mapped.host_ip : "localhost";
      window.open(`http://${host}:${mapped.host_port}`, "_blank");
    }
  };

  return (
    <Show
      when={props.composes.length > 0}
      fallback={
        <div class="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
          <img src={props.emptyIcon} class="w-28 h-28 opacity-80" />
          <p class="text-sm text-gray-500">{props.emptyMessage}</p>
        </div>
      }>
      <Accordion class="mt-2">
        <For each={props?.composes}>
          {(compose) => {
            const [hexColor] = createBGColorGenerator(compose.label);
            const hasRunning = createMemo(() =>
              compose.containers?.some((c) => c.status === ContainerStatus.RUNNING)
            );
            const isGroupLoading = createMemo(() =>
              Boolean(props.loadingComposeIds[compose.id || compose.label])
            );

            return (
              <AccordionItem
                open={true}
                title={
                  <div class="flex items-center justify-between w-full pr-2">
                    <div class="flex items-center justify-start gap-3 min-w-0">
                      <div class="h-7 w-7 flex items-center justify-center rounded text-md font-medium shrink-0">
                        <LayersIcon color={hexColor()} />
                      </div>
                      <span class="text-sm text-text-primary truncate">{compose.label}</span>
                    </div>
                    {/* Compose-level controls */}
                    <div class="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                      <Show
                        when={!isGroupLoading()}
                        fallback={
                          <div class="p-1 flex items-center justify-center">
                            <Spinner size={13} />
                          </div>
                        }>
                        <Show
                          when={hasRunning()}
                          fallback={
                            <button
                              type="button"
                              title={`Start all in ${compose.label}`}
                              onClick={(e) => props.onStartGroup(e, compose)}
                              class="p-1 rounded text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors cursor-pointer">
                              <PlayIcon size={13} />
                            </button>
                          }>
                          <button
                            type="button"
                            title={`Stop all in ${compose.label}`}
                            onClick={(e) => props.onStopGroup(e, compose)}
                            class="p-1 rounded text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer">
                            <StopIcon size={13} />
                          </button>
                        </Show>
                      </Show>
                      <button
                        type="button"
                        title={`Delete all in ${compose.label}`}
                        disabled={isGroupLoading()}
                        onClick={(e) => !isGroupLoading() && props.onDeleteGroup(e, compose)}
                        class={`p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer ${
                          isGroupLoading() ? "opacity-30 cursor-not-allowed pointer-events-none" : ""
                        }`}>
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  </div>
                }>
                <ul>
                  <For each={compose?.containers}>
                    {(c, index) => {
                      const [hexColor] = createBGColorGenerator(c.name);
                      const isActive = createMemo(() => isActiveRoute(`/containers/${c?.id}`));
                      const isRunning = createMemo(() => c?.status === ContainerStatus.RUNNING);
                      const hasPorts = createMemo(() =>
                        Boolean(c?.ports && c.ports.some((p) => Boolean(p.host_port)))
                      );
                      const isContainerLoading = createMemo(() =>
                        Boolean(props.loadingContainerIds[c.id])
                      );

                      return (
                        <li
                          onClick={() =>
                            navigate(`/containers/${c?.id}`, {
                              state: { container: c, color: hexColor() },
                            })
                          }
                          class={`p-1 cursor-pointer group/row ${
                            index() < (compose?.containers?.length ?? 0) - 1
                              ? "border-b-[0.03px] border-neutral-800"
                              : ""
                          }`}>
                          <div
                            class={`p-2 rounded-md flex items-center justify-between gap-2 ${
                              isActive() ? "bg-[#3B3B3B80]" : "hover:bg-neutral-900/60"
                            }`}>
                            <div class="flex items-center gap-3 min-w-0 flex-1">
                              {/* Dimmed icon if stopped / exited / paused */}
                              <div
                                class="h-8 w-8 rounded flex items-center justify-center shrink-0 transition-opacity"
                                style={{
                                  color: hexColor(),
                                  opacity: isRunning() ? "1" : "0.45",
                                }}>
                                <BoxIcons size={16} />
                              </div>
                              {/* Grayish text if stopped / exited / paused */}
                              <div class="min-w-0 flex-1">
                                <p
                                  class={`text-sm truncate transition-colors ${
                                    isRunning() ? "text-white" : "text-neutral-400"
                                  }`}>
                                  {c.name}
                                </p>
                                <p
                                  class={`truncate text-xs transition-colors ${
                                    isRunning() ? "text-gray-500" : "text-neutral-600"
                                  }`}>
                                  {c?.image}
                                </p>
                              </div>
                            </div>

                            {/* OrbStack container actions & status */}
                            <div class="flex items-center gap-1 shrink-0 ml-2">
                              {/* Port forward link */}
                              <Show when={isRunning() && hasPorts()}>
                                <button
                                  type="button"
                                  title="Open port in browser"
                                  onClick={(e) => handleOpenPort(e, c.ports)}
                                  class="p-1 rounded text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 transition-colors cursor-pointer">
                                  <LinkIcon size={13} />
                                </button>
                              </Show>

                              {/* Start / Stop toggle with loading spinner */}
                              <Show
                                when={!isContainerLoading()}
                                fallback={
                                  <div class="p-1 flex items-center justify-center">
                                    <Spinner size={13} />
                                  </div>
                                }>
                                <Show
                                  when={isRunning()}
                                  fallback={
                                    <button
                                      type="button"
                                      title="Start container"
                                      onClick={(e) => props.onStart(e, c.id)}
                                      class="p-1 rounded text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors cursor-pointer">
                                      <PlayIcon size={13} />
                                    </button>
                                  }>
                                  <button
                                    type="button"
                                    title="Stop container"
                                    onClick={(e) => props.onStop(e, c.id)}
                                    class="p-1 rounded text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer">
                                    <StopIcon size={13} />
                                  </button>
                                </Show>
                              </Show>

                              {/* Delete container */}
                              <button
                                type="button"
                                title="Delete container"
                                disabled={isContainerLoading()}
                                onClick={(e) => !isContainerLoading() && props.onDelete(e, c.id, c.name)}
                                class={`p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors cursor-pointer ${
                                  isContainerLoading() ? "opacity-30 cursor-not-allowed pointer-events-none" : ""
                                }`}>
                                <TrashIcon size={13} />
                              </button>

                              {/* Status dot */}
                              <Show when={isRunning()}>
                                <span class="ml-1 flex items-center">
                                  <StatusDot status={c?.status ?? ContainerStatus.RUNNING} size={8} />
                                </span>
                              </Show>
                            </div>
                          </div>
                        </li>
                      );
                    }}
                  </For>
                </ul>
              </AccordionItem>
            );
          }}
        </For>
      </Accordion>
    </Show>
  );
}

export default function ContainersSidebarPanel(props: any) {
  const rawComposes = createMemo(() => listContainersQuery() ?? []);
  const [overrides, setOverrides] = createSignal<
    Record<string, { status?: ContainerStatusType; deleted?: boolean }>
  >({});
  const [loadingContainerIds, setLoadingContainerIds] = createSignal<Record<string, boolean>>({});
  const [loadingComposeIds, setLoadingComposeIds] = createSignal<Record<string, boolean>>({});

  // Real-time synchronization via Docker SSE Events
  createEffect(
    () => true,
    () => {
      let isDisposed = false;
      const es = EventStream.streamDockerEvents();

      es.onmessage = (event) => {
        if (isDisposed || !event?.data) return;
        try {
          const data = JSON.parse(event.data);
          const type = (data.Type || data.type || "").toLowerCase();
          if (type && type !== "container") return;

          const action = (data.Action || data.status || "").toLowerCase();
          const containerId = data.id || data.Actor?.ID || "";
          if (!containerId) return;

          // Clear loading state when event confirms status change
          setLoadingContainerIds((prev) => ({ ...prev, [containerId]: false }));

          if (action === "start" || action === "unpause") {
            setOverrides((prev) => ({
              ...prev,
              [containerId]: { status: ContainerStatus.RUNNING },
            }));
          } else if (action === "stop" || action === "die") {
            setOverrides((prev) => ({
              ...prev,
              [containerId]: { status: ContainerStatus.EXITED },
            }));
          } else if (action === "pause") {
            setOverrides((prev) => ({
              ...prev,
              [containerId]: { status: ContainerStatus.PAUSED },
            }));
          } else if (action === "destroy") {
            setOverrides((prev) => ({
              ...prev,
              [containerId]: { deleted: true },
            }));
          }
        } catch (err) {
          console.error("Error processing docker event:", err);
        }
      };

      es.onerror = () => {
        es.close();
      };

      return () => {
        isDisposed = true;
        es.onmessage = null;
        es.onerror = null;
        es.close();
      };
    }
  );

  // Derive live composes by overlaying SSE overrides on query data
  const composes = createMemo(() => {
    const raw = rawComposes();
    if (!Array.isArray(raw)) return [];
    const ovs = overrides();

    return raw
      .map((group) => {
        const containers = group.containers
          ?.map((c) => {
            const matchedKey = Object.keys(ovs).find(
              (k) => k === c.id || k.startsWith(c.id) || c.id.startsWith(k)
            );
            if (matchedKey) {
              const ov = ovs[matchedKey];
              if (ov.deleted) return null;
              return { ...c, status: ov.status ?? c.status };
            }
            return c;
          })
          .filter(Boolean) as ContainerDTO[];

        const anyRunning = containers?.some((c) => c.status === ContainerStatus.RUNNING);

        return {
          ...group,
          containers,
          status: anyRunning ? ContainerStatus.RUNNING : ContainerStatus.EXITED,
        };
      })
      .filter((group) => (group.containers?.length ?? 0) > 0);
  });

  // Dynamic filter memos for Tabs
  const activeComposes = createMemo(() => {
    return composes()
      .map((group) => ({
        ...group,
        containers: group.containers?.filter((c) => c.status === ContainerStatus.RUNNING),
      }))
      .filter((group) => (group.containers?.length ?? 0) > 0);
  });

  const inactiveComposes = createMemo(() => {
    return composes()
      .map((group) => ({
        ...group,
        containers: group.containers?.filter((c) => c.status !== ContainerStatus.RUNNING),
      }))
      .filter((group) => (group.containers?.length ?? 0) > 0);
  });

  const totalRunningCount = createMemo(() => {
    let count = 0;
    for (const group of composes()) {
      for (const c of group.containers ?? []) {
        if (c.status === ContainerStatus.RUNNING) count++;
      }
    }
    return count;
  });

  const totalContainersCount = createMemo(() => {
    let count = 0;
    for (const group of composes()) {
      count += group.containers?.length ?? 0;
    }
    return count;
  });

  // Action Handlers
  const handleStart = async (e: MouseEvent, id: string) => {
    e.stopPropagation();
    setLoadingContainerIds((prev) => ({ ...prev, [id]: true }));
    try {
      await ContainerAPI.startContainer(id);
    } catch (err) {
      console.error("Failed to start container:", err);
    } finally {
      setLoadingContainerIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleStop = async (e: MouseEvent, id: string) => {
    e.stopPropagation();
    setLoadingContainerIds((prev) => ({ ...prev, [id]: true }));
    try {
      await ContainerAPI.stopContainer(id);
    } catch (err) {
      console.error("Failed to stop container:", err);
    } finally {
      setLoadingContainerIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (e: MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete container "${name}"?`)) {
      try {
        await ContainerAPI.deleteContainer(id);
      } catch (err) {
        console.error("Failed to delete container:", err);
      }
    }
  };

  const handleStartGroup = async (e: MouseEvent, compose: ComposeDTO) => {
    e.stopPropagation();
    const groupKey = compose.id || compose.label;
    const stopped = compose.containers?.filter((c) => c.status !== ContainerStatus.RUNNING) ?? [];
    setLoadingComposeIds((prev) => ({ ...prev, [groupKey]: true }));
    stopped.forEach((c) => setLoadingContainerIds((prev) => ({ ...prev, [c.id]: true })));
    try {
      await Promise.allSettled(stopped.map((c) => ContainerAPI.startContainer(c.id)));
    } finally {
      setLoadingComposeIds((prev) => ({ ...prev, [groupKey]: false }));
      stopped.forEach((c) => setLoadingContainerIds((prev) => ({ ...prev, [c.id]: false })));
    }
  };

  const handleStopGroup = async (e: MouseEvent, compose: ComposeDTO) => {
    e.stopPropagation();
    const groupKey = compose.id || compose.label;
    const running = compose.containers?.filter((c) => c.status === ContainerStatus.RUNNING) ?? [];
    setLoadingComposeIds((prev) => ({ ...prev, [groupKey]: true }));
    running.forEach((c) => setLoadingContainerIds((prev) => ({ ...prev, [c.id]: true })));
    try {
      await Promise.allSettled(running.map((c) => ContainerAPI.stopContainer(c.id)));
    } finally {
      setLoadingComposeIds((prev) => ({ ...prev, [groupKey]: false }));
      running.forEach((c) => setLoadingContainerIds((prev) => ({ ...prev, [c.id]: false })));
    }
  };

  const handleDeleteGroup = async (e: MouseEvent, compose: ComposeDTO) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete all containers in "${compose.label}"?`)) {
      const containers = compose.containers ?? [];
      await Promise.allSettled(containers.map((c) => ContainerAPI.deleteContainer(c.id)));
    }
  };

  return (
    <div class="flex-1 h-full p-2">
      <div class="h-full">
        <div class="border-b-[0.03px] border-neutral-800 pb-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-md font-medium text-white">{props.label ?? "Containers"}</span>
            <Show when={totalContainersCount() > 0}>
              <span class="text-[11px] px-1.5 py-0.5 rounded font-mono bg-neutral-800 text-neutral-400">
                {totalRunningCount()} running
              </span>
            </Show>
          </div>
        </div>
        <Tabs defaultValue="all">
          <TabsList style="mt-3 bg-[#151619] p-1 rounded-md gap-1" indicatorStyle="bg-[#3B3B3B80]">
            <TabsTrigger value="all" style="flex-1 flex flex-row items-center justify-center gap-1.5 text-center">
              <span class="text-blue-300">All</span>
              <Show when={totalContainersCount() > 0}>
                <span class="text-[10px] opacity-75 font-mono text-blue-300/80">({totalContainersCount()})</span>
              </Show>
            </TabsTrigger>
            <TabsTrigger value="running" style="flex-1 flex flex-row items-center justify-center gap-1.5 text-center">
              <span class="text-green-300">Running</span>
              <Show when={totalContainersCount() > 0}>
                <span class="text-[10px] opacity-75 font-mono text-green-300/80">({totalRunningCount()})</span>
              </Show>
            </TabsTrigger>
            <TabsTrigger value="exited" style="flex-1 flex flex-row items-center justify-center gap-1.5 text-center">
              <span class="text-red-300">Exited</span>
              <Show when={totalContainersCount() > 0}>
                <span class="text-[10px] opacity-75 font-mono text-red-300/80">
                  ({totalContainersCount() - totalRunningCount()})
                </span>
              </Show>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Loading>
              <ComposeList
                composes={composes()}
                emptyIcon={allContainersSvg}
                emptyMessage="No containers found"
                loadingContainerIds={loadingContainerIds()}
                loadingComposeIds={loadingComposeIds()}
                onStart={handleStart}
                onStop={handleStop}
                onDelete={handleDelete}
                onStartGroup={handleStartGroup}
                onStopGroup={handleStopGroup}
                onDeleteGroup={handleDeleteGroup}
              />
            </Loading>
          </TabsContent>
          <TabsContent value="running">
            <Loading>
              <ComposeList
                composes={activeComposes()}
                emptyIcon={activeContainersSvg}
                emptyMessage="No active containers running"
                loadingContainerIds={loadingContainerIds()}
                loadingComposeIds={loadingComposeIds()}
                onStart={handleStart}
                onStop={handleStop}
                onDelete={handleDelete}
                onStartGroup={handleStartGroup}
                onStopGroup={handleStopGroup}
                onDeleteGroup={handleDeleteGroup}
              />
            </Loading>
          </TabsContent>
          <TabsContent value="exited">
            <Loading>
              <ComposeList
                composes={inactiveComposes()}
                emptyIcon={activeContainersSvg}
                emptyMessage="No exited containers found"
                loadingContainerIds={loadingContainerIds()}
                loadingComposeIds={loadingComposeIds()}
                onStart={handleStart}
                onStop={handleStop}
                onDelete={handleDelete}
                onStartGroup={handleStartGroup}
                onStopGroup={handleStopGroup}
                onDeleteGroup={handleDeleteGroup}
              />
            </Loading>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
