import { createEffect, createMemo, createSignal, For, Loading, Show } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { listVolumesQuery } from "../queries";
import VolumesAPI from "../api";
import EventStream from "../../events/stream";
import { createBGColorGenerator } from "../../../global/reactivity/createBgColor";
import { VolumeIcon } from "../../../global/components/_icons/volume";
import { TrashIcon } from "../../../global/components/_icons/trash";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../global/components/_common/tabs";
import { StatusDot } from "../../../global/components/_common/statusDot";
import { ContainerStatus } from "../../containers/constant";
import type { VolumeDTO } from "../types";
import { formatBytes, formatTimeAgoString } from "../mapper";
import allContainersSvg from "~/assets/_svgs/allContainers.svg";
import activeContainersSvg from "~/assets/_svgs/activeContainers.svg";
import { isSidebarRouteActive } from "../../../global/utils/route";
import { listContainersQuery } from "../../containers/queries";
import {
  SidebarPanelHeader,
  SidebarEmptyState,
  SidebarListItem,
  SidebarActionButton,
} from "../../../global/components/_common/sidebarPanel";

function VolumeList(props: {
  volumes: VolumeDTO[];
  emptyIcon: string;
  emptyMessage: string;
  loadingVolumeNames: Record<string, boolean>;
  onDelete: (e: MouseEvent, name: string) => void;
  isInUse: (vol: VolumeDTO) => boolean;
}) {
  const location = useLocation();
  const isActiveRoute = (path: string) => {
    const current = decodeURIComponent(location.pathname);
    const target = decodeURIComponent(path);
    return isSidebarRouteActive(current, target);
  };
  const navigate = useNavigate();

  return (
    <Show
      when={props.volumes.length > 0}
      fallback={<SidebarEmptyState icon={props.emptyIcon} message={props.emptyMessage} />}>
      <ul class="mt-2">
        <For each={props.volumes}>
          {(vol, index) => {
            const displayName = createMemo(() => {
              if (vol.name.length > 20 && !vol.name.includes("_") && !vol.name.includes("-")) {
                return vol.name.slice(0, 12);
              }
              return vol.name;
            });
            const [hexColor] = createBGColorGenerator(vol.name);
            const inUse = createMemo(() => props.isInUse(vol));
            const isActive = createMemo(() => isActiveRoute(`/volumes/${encodeURIComponent(vol.name)}`));
            const isLoading = createMemo(() => Boolean(props.loadingVolumeNames[vol.name]));
            const subtitleText = createMemo(() => {
              const driver = vol.driver || "local";
              const time = formatTimeAgoString(vol.created_at);
              const size =
                vol.size !== undefined && vol.size !== null
                  ? ` · ${formatBytes(vol.size)}`
                  : "";
              return `${driver} · ${time}${size}`;
            });

            return (
              <SidebarListItem
                isActive={isActive()}
                onClick={() =>
                  navigate(`/volumes/${encodeURIComponent(vol.name)}`, {
                    state: { volume: vol, color: hexColor(), status: inUse() },
                  })
                }
                isLast={index() === props.volumes.length - 1}
                color={hexColor()}
                dimmed={!inUse()}
                icon={<VolumeIcon size={24} color={hexColor()} />}
                title={displayName()}
                subtitle={subtitleText()}
                actions={
                  <>
                    <SidebarActionButton
                      title="Delete volume"
                      variant="danger"
                      loading={isLoading()}
                      onClick={(e) => props.onDelete(e, vol.name)}>
                      <TrashIcon size={13} />
                    </SidebarActionButton>

                    <Show when={inUse()}>
                      <span class="ml-1 flex items-center">
                        <StatusDot status={ContainerStatus.RUNNING} size={8} />
                      </span>
                    </Show>
                  </>
                }
              />
            );
          }}
        </For>
      </ul>
    </Show>
  );
}

export default function VolumesSidebarPanel(props: any) {
  const rawVolumes = createMemo(() => listVolumesQuery() ?? []);
  const rawContainers = createMemo(() => listContainersQuery() ?? []);
  const [deletedNames, setDeletedNames] = createSignal<Record<string, boolean>>({});
  const [loadingVolumeNames, setLoadingVolumeNames] = createSignal<Record<string, boolean>>({});

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
          if (type && type !== "volume") return;

          const action = (data.Action || data.status || "").toLowerCase();
          const volumeName = data.Actor?.Attributes?.volume || data.Actor?.ID || data.id || "";
          if (!volumeName) return;

          setLoadingVolumeNames((prev) => ({ ...prev, [volumeName]: false }));

          if (action === "destroy" || action === "delete") {
            setDeletedNames((prev) => ({ ...prev, [volumeName]: true }));
          }
        } catch (err) {
          console.error("Error processing docker volume event:", err);
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

  // Set of volume names referenced by containers
  const usedVolumeNames = createMemo(() => {
    const set = new Set<string>();
    for (const group of rawContainers()) {
      for (const c of group.containers ?? []) {
        for (const m of c.mounts ?? (c as any).Mounts ?? []) {
          const name = m.name || (m as any).Name || "";
          if (name) {
            set.add(name);
          }
          const src = m.source || (m as any).Source || "";
          if (src) {
            set.add(src);
            const baseName = src.split("/").pop();
            if (baseName) set.add(baseName);
          }
        }
      }
    }
    return set;
  });

  const isVolumeInUse = (vol: VolumeDTO) => {
    if (vol.ref_count !== undefined && vol.ref_count !== null && vol.ref_count >= 0) {
      return vol.ref_count > 0;
    }
    const set = usedVolumeNames();
    if (set.has(vol.name)) return true;
    if (vol.mountpoint && set.has(vol.mountpoint)) return true;
    return false;
  };

  const volumes = createMemo<VolumeDTO[]>(() => {
    const raw = rawVolumes();
    if (!Array.isArray(raw)) return [];
    const deleted = deletedNames();
    return raw.filter((v) => !deleted[v.name]);
  });

  const inUsedVolumes = createMemo(() => volumes().filter((v) => isVolumeInUse(v)));
  const unUsedVolumes = createMemo(() => volumes().filter((v) => !isVolumeInUse(v)));

  const totalVolumeSize = createMemo(() => {
    let total = 0;
    for (const v of volumes()) {
      if (v.size && v.size > 0) {
        total += v.size;
      }
    }
    return formatBytes(total);
  });

  const handleDelete = async (e: MouseEvent, name: string) => {
    e.stopPropagation();
    const confirmed = confirm(`Are you sure you want to delete volume "${name}"?`);
    if (confirmed) {
      setLoadingVolumeNames((prev) => ({ ...prev, [name]: true }));
      try {
        await VolumesAPI.deleteVolumeByName(name);
        setDeletedNames((prev) => ({ ...prev, [name]: true }));
      } catch (err) {
        console.error("Failed to delete volume:", err);
        alert(`Failed to delete volume "${name}". Make sure it is not in use by any container.`);
      } finally {
        setLoadingVolumeNames((prev) => ({ ...prev, [name]: false }));
      }
    }
  };

  return (
    <div class="flex-1 h-full p-2">
      <div class="h-full">
        <SidebarPanelHeader
          title={props.label ?? "Volumes"}
          subtitle={volumes().length > 0 ? `${totalVolumeSize()} total` : undefined}
          badge={volumes().length > 0 ? `${inUsedVolumes().length} in use` : undefined}
        />
        <Tabs defaultValue="inUsed">
          <TabsList style="mt-3 bg-[#151619] p-1 rounded-md gap-1" indicatorStyle="bg-[#3B3B3B80]">
            <TabsTrigger value="inUsed" style="flex-1 flex flex-row items-center justify-center gap-1.5 text-center">
              <span class="text-green-300">In used</span>
              <Show when={volumes().length > 0}>
                <span class="text-[10px] opacity-75 font-mono text-green-300/80">({inUsedVolumes().length})</span>
              </Show>
            </TabsTrigger>
            <TabsTrigger value="unUsed" style="flex-1 flex flex-row items-center justify-center gap-1.5 text-center">
              <span class="text-amber-300">Unused</span>
              <Show when={volumes().length > 0}>
                <span class="text-[10px] opacity-75 font-mono text-amber-300/80">({unUsedVolumes().length})</span>
              </Show>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="inUsed">
            <Loading>
              <VolumeList
                volumes={inUsedVolumes()}
                emptyIcon={activeContainersSvg}
                emptyMessage="No volumes in use"
                loadingVolumeNames={loadingVolumeNames()}
                onDelete={handleDelete}
                isInUse={isVolumeInUse}
              />
            </Loading>
          </TabsContent>
          <TabsContent value="unUsed">
            <Loading>
              <VolumeList
                volumes={unUsedVolumes()}
                emptyIcon={allContainersSvg}
                emptyMessage="No unused volumes found"
                loadingVolumeNames={loadingVolumeNames()}
                onDelete={handleDelete}
                isInUse={isVolumeInUse}
              />
            </Loading>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
