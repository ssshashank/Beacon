import { createMemo, createSignal, lazy, Loading, Show } from "solid-js";
import { useLocation, useNavigate, useParams } from "@solidjs/router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../global/components/_common/tabs";
import { StatusDot } from "../../../global/components/_common/statusDot";
import Tooltip from "../../../global/components/_common/tooltip";
import { CopyIcon } from "../../../global/components/_icons/copy";
import { TrashIcon } from "../../../global/components/_icons/trash";
import { inspectVolumeByNameQuery } from "../../../modules/volumes/queries";
import { createBGColorGenerator } from "../../../global/reactivity/createBgColor";
import { ContainerStatus } from "../../../modules/containers/constant";
import { listContainersQuery } from "../../../modules/containers/queries";
import VolumesAPI from "../../../modules/volumes/api";

const LazyVolumeInfo = lazy(() => import("../../../modules/volumes/components/volumeInfo"));

export default function VolumeByNameScreen() {
  const params = useParams();
  const location: any = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = createSignal(false);
  const [deleting, setDeleting] = createSignal(false);

  const decodedName = createMemo(() => decodeURIComponent(params?.id ?? ""));
  const inspectVolume = createMemo(() => inspectVolumeByNameQuery(decodedName()));

  const fallback = () => (location?.state?.volume ?? {}) as any;
  const data = createMemo<any>(() => inspectVolume() ?? {});

  const volumeName = createMemo(() => {
    return data()?.Name || fallback()?.name || decodedName();
  });

  const driver = createMemo(() => {
    return data()?.Driver || fallback()?.driver || "local";
  });

  const mountpoint = createMemo(() => {
    return data()?.Mountpoint || fallback()?.mountpoint || "";
  });

  const [autoColor] = createBGColorGenerator(() => volumeName());
  const titleColor = () => location?.state?.color || autoColor();

  const containers = createMemo(() => listContainersQuery() ?? []);

  const isInUse = createMemo(() => {
    const volName = volumeName();
    if (!volName) return false;
    const refCount = data()?.UsageData?.RefCount ?? fallback()?.ref_count;
    if (refCount !== undefined && refCount !== null && refCount >= 0) {
      return refCount > 0;
    }
    for (const group of containers()) {
      for (const c of group.containers ?? []) {
        const mounts = c.mounts ?? (c as any).Mounts ?? [];
        for (const m of mounts) {
          const mName = m.name || (m as any).Name || "";
          const mSrc = m.source || (m as any).Source || "";
          if (mName === volName || mSrc === volName || mSrc.endsWith(`/${volName}`)) {
            return true;
          }
        }
      }
    }
    return false;
  });

  const handleCopyMountpoint = async () => {
    const textToCopy = mountpoint() || volumeName();
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDelete = async () => {
    const name = volumeName();
    if (!name) return;
    const confirmed = confirm(`Are you sure you want to delete volume "${name}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await VolumesAPI.deleteVolumeByName(name);
      navigate("/volumes");
    } catch (err) {
      console.error("Failed to delete volume:", err);
      alert(`Failed to delete volume "${name}". Make sure it is not in use by any container.`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main class="w-full h-full p-2 flex flex-col">
      {/* Header exactly like container/[id].tsx and images/[id].tsx */}
      <div class="border-b-[0.03px] border-neutral-700 pb-2 shrink-0">
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center justify-start gap-3">
              <StatusDot status={isInUse() ? ContainerStatus.RUNNING : ContainerStatus.EXITED} size={10} />
              <div>
                <span style={{ color: titleColor() }} class="text-md font-medium">
                  {volumeName()}
                </span>
                <span class="text-gray-500 font-mono text-sm">
                  &nbsp;&nbsp;/&nbsp;&nbsp;{driver()}
                </span>
                <Show when={mountpoint()}>
                  <div class="flex items-center justify-start gap-3 cursor-pointer mt-0.5" onClick={handleCopyMountpoint}>
                    <span class="text-xs text-gray-500 font-mono truncate max-w-[400px]" title={mountpoint()}>
                      {mountpoint()}
                    </span>
                    <Tooltip as="span" title={copied() ? "copied" : "copy"}>
                      <CopyIcon size={14} color="gray" />
                    </Tooltip>
                  </div>
                </Show>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                disabled={deleting()}
                onClick={handleDelete}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#222326] hover:bg-red-950/60 text-neutral-300 hover:text-red-400 border border-neutral-700/60 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50">
                <TrashIcon size={13} />
                <span>{deleting() ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Area */}
      <div class="flex-1 min-h-0">
        <div class="h-full flex flex-col">
          <Tabs defaultValue="info">
            <div class="w-fit">
              <TabsList style="mt-1 bg-[#0A0A0B] p-1 rounded-md gap-1 w-fit" indicatorStyle="bg-[#3B3B3B80]">
                <TabsTrigger value="info" style="flex flex-row items-center justify-center gap-3 text-center">
                  <span>Info</span>
                </TabsTrigger>
                <TabsTrigger value="files" style="flex flex-row items-center justify-center gap-3 text-center">
                  <span>Files</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div class="mt-2 w-full rounded-md flex-1 min-h-0">
              <TabsContent value="info" class="h-full overflow-y-auto">
                <Loading
                  fallback={
                    <div class="h-full flex items-center justify-center text-gray-500">
                      Loading...
                    </div>
                  }>
                  <LazyVolumeInfo
                    inspect={inspectVolume}
                    initialVolume={fallback()}
                    paramsName={decodedName()}
                  />
                </Loading>
              </TabsContent>
              <TabsContent value="files" class="h-full overflow-y-auto">
                <div class="h-full flex items-center justify-center text-neutral-500 text-sm">
                  Files stored in this volume mountpoint
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
