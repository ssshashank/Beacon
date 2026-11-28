import { createMemo, createSignal, lazy, Loading, Show } from "solid-js";
import { useLocation, useNavigate, useParams } from "@solidjs/router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../global/components/_common/tabs";
import { StatusDot } from "../../../global/components/_common/statusDot";
import Tooltip from "../../../global/components/_common/tooltip";
import { CopyIcon } from "../../../global/components/_icons/copy";
import { TrashIcon } from "../../../global/components/_icons/trash";
import { inspectNetworkByIDQuery } from "../../../modules/networks/queries";
import { createBGColorGenerator } from "../../../global/reactivity/createBgColor";
import { createClipboard } from "../../../global/reactivity/createClipboard";
import { ContainerStatus } from "../../../modules/containers/constant";
import NetworksAPI from "../../../modules/networks/api";

const LazyNetworkInfo = lazy(() => import("../../../modules/networks/components/networkInfo"));

export default function NetworkByIDScreen() {
  const params = useParams();
  const location: any = useLocation();
  const navigate = useNavigate();
  const { copy, copied } = createClipboard();
  const [deleting, setDeleting] = createSignal(false);

  const decodedId = createMemo(() => decodeURIComponent(params?.id ?? ""));
  const inspectNetwork = createMemo(() => inspectNetworkByIDQuery(decodedId()));

  const fallback = () => (location?.state?.network ?? {}) as any;
  const data = createMemo<any>(() => inspectNetwork() ?? {});

  const fullId = createMemo(() => {
    return data()?.Id || fallback()?.id || decodedId();
  });

  const networkName = createMemo(() => {
    return data()?.Name || fallback()?.name || fullId().slice(0, 12);
  });

  const driver = createMemo(() => {
    return data()?.Driver || fallback()?.driver || "bridge";
  });

  const [autoColor] = createBGColorGenerator(() => networkName());
  const titleColor = () => location?.state?.color || autoColor();

  const isInUse = createMemo(() => {
    const containersObj = data()?.Containers || fallback()?.containers || {};
    return Object.keys(containersObj).length > 0;
  });

  const handleCopyId = () => copy(fullId());

  const handleDelete = async () => {
    const id = fullId();
    const name = networkName();
    if (!id) return;
    const confirmed = confirm(`Are you sure you want to delete network "${name}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await NetworksAPI.deleteNetworkByID(id);
      navigate("/networks");
    } catch (err) {
      console.error("Failed to delete network:", err);
      alert(`Failed to delete network "${name}". Predefined networks or networks in use cannot be deleted.`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main class="w-full h-full p-2 flex flex-col">
      {/* Header exactly like container/[id].tsx, images/[id].tsx, and volumes/[id].tsx */}
      <div class="border-b-[0.03px] border-neutral-700 pb-2 shrink-0">
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center justify-start gap-3">
              <StatusDot status={isInUse() ? ContainerStatus.RUNNING : ContainerStatus.EXITED} size={10} />
              <div>
                <span style={{ color: titleColor() }} class="text-md font-medium">
                  {networkName()}
                </span>
                <span class="text-gray-500 font-mono text-sm">
                  &nbsp;&nbsp;/&nbsp;&nbsp;{driver()}
                </span>
                <div class="flex items-center justify-start gap-3 cursor-pointer mt-0.5" onClick={handleCopyId}>
                  <span class="text-xs text-gray-500 font-mono truncate max-w-[400px]" title={fullId()}>
                    {fullId()}
                  </span>
                  <Tooltip as="span" title={copied() ? "copied" : "copy"}>
                    <CopyIcon size={14} color="gray" />
                  </Tooltip>
                </div>
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
                  <LazyNetworkInfo
                    inspect={inspectNetwork}
                    initialNetwork={fallback()}
                    paramsId={decodedId()}
                  />
                </Loading>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
