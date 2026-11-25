import { createMemo, createSignal, lazy, Loading } from "solid-js";
import { useLocation, useParams } from "@solidjs/router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../global/components/_common/tabs";
import { StatusDot } from "../../../global/components/_common/statusDot";
import Tooltip from "../../../global/components/_common/tooltip";
import { CopyIcon } from "../../../global/components/_icons/copy";
import { ExportIcon } from "../../../global/components/_icons/export";
import { inspectImageByIDQuery } from "../../../modules/images/queries";
import { createBGColorGenerator } from "../../../global/reactivity/createBgColor";
import { ContainerStatus } from "../../../modules/containers/constant";
import { listContainersQuery } from "../../../modules/containers/queries";
import ImagesAPI from "../../../modules/images/api";

const LazyImageInfo = lazy(() => import("../../../modules/images/components/imageInfo"));
const LazyImageHistory = lazy(() => import("../../../modules/images/components/imageHistory"));

export default function ImageByIDScreen() {
  const params = useParams();
  const location: any = useLocation();
  const [copied, setCopied] = createSignal(false);
  const [exporting, setExporting] = createSignal(false);

  const decodedId = createMemo(() => decodeURIComponent(params?.id ?? ""));
  const inspectImage = createMemo(() => inspectImageByIDQuery(decodedId()));

  const fallback = () => location?.state?.image ?? {};
  const data = createMemo(() => inspectImage() ?? {});

  const fullId = createMemo(() => {
    return data()?.Id || fallback()?.id || decodedId();
  });

  const subId = createMemo(() => {
    return fullId().replace("sha256:", "");
  });

  const imageName = createMemo(() => {
    if (fallback()?.name && fallback()?.name !== "<none>") return fallback().name;
    const repoTags: string[] = data()?.RepoTags || fallback()?.repo_tags || [];
    if (repoTags.length > 0) {
      return repoTags[0].split(":")[0];
    }
    return subId().slice(0, 12);
  });

  const [autoColor] = createBGColorGenerator(() => imageName());
  const titleColor = () => location?.state?.color || autoColor();

  const containers = createMemo(() => listContainersQuery() ?? []);

  const handleCopyId = async () => {
    const textToCopy = fullId();
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleExport = async () => {
    const id = decodedId();
    if (!id) return;
    setExporting(true);
    try {
      await ImagesAPI.exportImageByID(id);
      alert(`Image export initiated for "${imageName()}"`);
    } catch (err) {
      console.error("Failed to export image:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <main class="w-full h-full p-2 flex flex-col">
      {/* Header exactly like container/[id].tsx and Image 2 with Export on the top right */}
      <div class="border-b-[0.03px] border-neutral-700 pb-2 shrink-0">
        <div>
          <div class="flex items-center justify-between">
            <div class="flex items-center justify-start gap-3">
              <div>
                <span style={{ color: titleColor() }} class="text-md">
                  {imageName()}
                </span>
                <div class="flex items-center justify-start gap-3 cursor-pointer" onClick={handleCopyId}>
                  <span class="text-xs text-gray-600">
                    {subId()}
                  </span>
                  <Tooltip as="span" title={copied() ? "copied" : "copy"}>
                    <CopyIcon size={16} color="gray" />
                  </Tooltip>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                disabled={exporting()}
                onClick={handleExport}
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#222326] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50">
                <ExportIcon size={14} />
                <span>{exporting() ? "Exporting..." : "Export"}</span>
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
                <TabsTrigger value="history" style="flex flex-row items-center justify-center gap-3 text-center">
                  <span>History</span>
                </TabsTrigger>
                <TabsTrigger value="terminal" style="flex flex-row items-center justify-center gap-3 text-center">
                  <span>Terminal</span>
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
                  <LazyImageInfo
                    inspect={inspectImage}
                    initialImage={fallback()}
                    paramsId={decodedId()}
                  />
                </Loading>
              </TabsContent>
              <TabsContent value="history" class="h-full overflow-y-auto">
                <LazyImageHistory id={decodedId()} />
              </TabsContent>
              <TabsContent value="terminal" class="h-full overflow-y-auto">
                <div class="h-full flex items-center justify-center text-neutral-500 text-sm">
                  Terminal is available when a container is running from this image
                </div>
              </TabsContent>
              <TabsContent value="files" class="h-full overflow-y-auto">
                <div class="h-full flex items-center justify-center text-neutral-500 text-sm">
                  Files view for image layers
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
