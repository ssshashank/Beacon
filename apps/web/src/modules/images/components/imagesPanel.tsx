import { createEffect, createMemo, createSignal, For, Loading, Show } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { listImagesQuery } from "../queries";
import ImagesAPI from "../api";
import EventStream from "../../events/stream";
import { createBGColorGenerator } from "../../../global/reactivity/createBgColor";
import { LayersIcon } from "../../../global/components/_icons/layers";
import { TrashIcon } from "../../../global/components/_icons/trash";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../global/components/_common/tabs";
import { StatusDot } from "../../../global/components/_common/statusDot";
import { ContainerStatus } from "../../containers/constant";
import type { ImageDTO } from "../types";
import { formatBytes } from "../mapper";
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

function ImageList(props: {
  images: ImageDTO[];
  emptyIcon: string;
  emptyMessage: string;
  loadingImageIds: Record<string, boolean>;
  onDelete: (e: MouseEvent, id: string, name: string) => void;
  isInUse: (img: ImageDTO) => boolean;
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
      when={props.images.length > 0}
      fallback={<SidebarEmptyState icon={props.emptyIcon} message={props.emptyMessage} />}>
      <ul class="mt-2">
        <For each={props.images}>
          {(img, index) => {
            const displayName = createMemo(() => {
              if (img.name && img.name !== "<none>") return img.name;
              const shortId = img.id?.replace("sha256:", "").slice(0, 12);
              return shortId || "<none>";
            });
            const [hexColor] = createBGColorGenerator(displayName());
            const inUse = createMemo(() => props.isInUse(img));
            const isActive = createMemo(() => isActiveRoute(`/images/${img.id}`));
            const isImageLoading = createMemo(() => Boolean(props.loadingImageIds[img.id]));
            const tagText = createMemo(() => (img.tag && img.tag !== "<none>" ? img.tag : "latest"));
            const sizeText = createMemo(() => formatBytes(img.size || 0));

            return (
              <SidebarListItem
                isActive={isActive()}
                onClick={() =>
                  navigate(`/images/${img.id}`, {
                    state: { image: img, color: hexColor(), status: inUse() },
                  })
                }
                isLast={index() === props.images.length - 1}
                color={hexColor()}
                dimmed={!inUse()}
                icon={<LayersIcon size={24} color={hexColor()} />}
                title={displayName()}
                subtitle={`${tagText()} · ${sizeText()}`}
                actions={
                  <>
                    <SidebarActionButton
                      title="Delete image"
                      variant="danger"
                      loading={isImageLoading()}
                      onClick={(e) => props.onDelete(e, img.id, displayName())}>
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

export default function ImagesSidebarPanel(props: any) {
  const rawImages = createMemo(() => listImagesQuery() ?? []);
  const rawContainers = createMemo(() => listContainersQuery() ?? []);
  const [deletedIds, setDeletedIds] = createSignal<Record<string, boolean>>({});
  const [loadingImageIds, setLoadingImageIds] = createSignal<Record<string, boolean>>({});

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
          if (type && type !== "image") return;

          const action = (data.Action || data.status || "").toLowerCase();
          const imageId = data.id || data.Actor?.ID || "";
          if (!imageId) return;

          setLoadingImageIds((prev) => ({ ...prev, [imageId]: false }));

          if (action === "delete" || action === "untag") {
            setDeletedIds((prev) => ({ ...prev, [imageId]: true }));
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

  // Set of images currently referenced by containers
  const containerImages = createMemo(() => {
    const set = new Set<string>();
    for (const group of rawContainers()) {
      for (const c of group.containers ?? []) {
        if (c.image) set.add(c.image);
      }
    }
    return set;
  });

  const isImageInUse = (img: ImageDTO) => {
    if (img.containers && img.containers > 0) return true;
    const set = containerImages();
    if (set.has(img.name)) return true;
    if (img.tag && set.has(`${img.name}:${img.tag}`)) return true;
    if (set.has(img.id) || set.has(img.id?.replace("sha256:", ""))) return true;
    for (const tag of img.repo_tags ?? []) {
      if (set.has(tag)) return true;
    }
    return false;
  };

  const images = createMemo<ImageDTO[]>(() => {
    const raw = rawImages();
    if (!Array.isArray(raw)) return [];
    const deleted = deletedIds();
    return raw.filter((img) => {
      const isDel = Object.keys(deleted).some(
        (k) => (k === img.id || k.startsWith(img.id) || img.id?.startsWith(k)) && deleted[k]
      );
      return !isDel;
    });
  });

  const inUsedImages = createMemo(() => images().filter(isImageInUse));
  const unUsedImages = createMemo(() => images().filter((img) => !isImageInUse(img)));

  const totalImageSize = createMemo(() => {
    let total = 0;
    for (const img of images()) {
      if (img.size && img.size > 0) {
        total += img.size;
      }
    }
    return formatBytes(total);
  });

  const handleDelete = async (e: MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete image "${name}"?`)) {
      setLoadingImageIds((prev) => ({ ...prev, [id]: true }));
      try {
        await ImagesAPI.deleteImage(id);
        setDeletedIds((prev) => ({ ...prev, [id]: true }));
      } catch (err) {
        console.error("Failed to delete image:", err);
      } finally {
        setLoadingImageIds((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  return (
    <div class="flex-1 h-full p-2">
      <div class="h-full">
        <SidebarPanelHeader
          title={props.label ?? "Images"}
          subtitle={images().length > 0 ? `${totalImageSize()} total` : undefined}
          badge={images().length > 0 ? `${inUsedImages().length} in use` : undefined}
        />
        <Tabs defaultValue="inUsed">
          <TabsList style="mt-3 bg-[#151619] p-1 rounded-md gap-1" indicatorStyle="bg-[#3B3B3B80]">
            <TabsTrigger value="inUsed" style="flex-1 flex flex-row items-center justify-center gap-1.5 text-center">
              <span class="text-green-300">In used</span>
              <Show when={images().length > 0}>
                <span class="text-[10px] opacity-75 font-mono text-green-300/80">({inUsedImages().length})</span>
              </Show>
            </TabsTrigger>
            <TabsTrigger value="unUsed" style="flex-1 flex flex-row items-center justify-center gap-1.5 text-center">
              <span class="text-amber-300">Unused</span>
              <Show when={images().length > 0}>
                <span class="text-[10px] opacity-75 font-mono text-amber-300/80">({unUsedImages().length})</span>
              </Show>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="inUsed">
            <Loading>
              <ImageList
                images={inUsedImages()}
                emptyIcon={activeContainersSvg}
                emptyMessage="No images in use"
                loadingImageIds={loadingImageIds()}
                onDelete={handleDelete}
                isInUse={isImageInUse}
              />
            </Loading>
          </TabsContent>
          <TabsContent value="unUsed">
            <Loading>
              <ImageList
                images={unUsedImages()}
                emptyIcon={allContainersSvg}
                emptyMessage="No unused images found"
                loadingImageIds={loadingImageIds()}
                onDelete={handleDelete}
                isInUse={isImageInUse}
              />
            </Loading>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
