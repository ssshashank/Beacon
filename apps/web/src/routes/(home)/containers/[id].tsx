import { createMemo, lazy, Loading, Show } from "solid-js";
import { useLocation, useParams } from "@solidjs/router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../global/components/_common/tabs";
import { CopyIcon } from "../../../global/components/_icons/copy";
import { StatusDot } from "../../../global/components/_common/statusDot";
import Tooltip from "../../../global/components/_common/tooltip";
import { inspectContainerByIDQuery } from "../../../modules/containers/queries";
import { ContainerStatus } from "../../../modules/containers/constant";
import ContainerNotFound from "../../../modules/containers/components/notFound";
const LazyContainerInfo = lazy(() => import("../../../modules/containers/components/containerInfo"));
const LazyContainerStats = lazy(() => import("../../../modules/containers/components/containerStats"));
const LazyContainerLogs = lazy(() => import("../../../modules/containers/components/containerLogs"));
const LazyContainerFiles = lazy(() => import("../../../modules/containers/components/containerFiles"));

export default function ContainerByIDScreen() {
  const params = useParams();
  const location: any = useLocation();
  const container = createMemo(() => inspectContainerByIDQuery(params?.id!));

  return (
    <main class='w-full h-full p-2 flex flex-col'>
      <div class='border-b-[0.03px] border-neutral-700 pb-2 shrink-0'>
        <div>
          <div class='flex items-center justify-start gap-3'>
            <StatusDot status={container()?.State?.Status} size={10} />
            <div>
              <span style={{ color: location?.state?.color }} class='text-md'>
                {location?.state?.container?.name}
              </span>
              &nbsp;&nbsp;/&nbsp;&nbsp;
              <span class="text-gray-500">
                {container().Config?.Image!}
              </span>
              <div class='flex items-center justify-start gap-3 cursor-pointer'>
                <span class='text-xs text-gray-600'>
                  {container()?.Id}
                </span>
                <Tooltip as="span" title="copy">
                  <CopyIcon size={16} color="gray" />
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class='flex-1 min-h-0'>
        <div class="h-full flex flex-col">
          <Tabs defaultValue="info" >
            <div class='w-100 shrink-0'>
              <TabsList style="mt-3 bg-[#0A0A0B] p-1 rounded-md gap-1" indicatorStyle="bg-[#3B3B3B80]">
                <TabsTrigger value="info" style="flex-1 flex flex-row items-center justify-center gap-3 text-center">
                  <span>Info</span>
                </TabsTrigger>
                <TabsTrigger value="stats" style="flex-1 flex flex-row items-center justify-center gap-3 text-center">
                  <span>Stats</span>
                </TabsTrigger>
                <TabsTrigger value="logs" style="flex-1 flex flex-row items-center justify-center gap-3 text-center">
                  <span>Logs</span>
                </TabsTrigger>
                <TabsTrigger value="files" style="flex-1 flex flex-row items-center justify-center gap-3 text-center">
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
                  <LazyContainerInfo container={container} />
                </Loading>
              </TabsContent>
              <TabsContent value="stats" class="h-full overflow-y-auto">
                <Show
                  when={container()?.State?.Status === ContainerStatus.RUNNING}
                  fallback={<ContainerNotFound />}>
                  <Loading
                    fallback={
                      <div class="h-full flex items-center justify-center text-gray-500">
                        Loading...
                      </div>
                    }>
                    <LazyContainerStats params={params} />
                  </Loading>
                </Show>
              </TabsContent>
              <TabsContent value="logs" class="h-full overflow-y-auto">
                <Show
                  when={container()?.State?.Status === ContainerStatus.RUNNING}
                  fallback={<ContainerNotFound />}>
                  <Loading
                    fallback={
                      <div class="h-full flex items-center justify-center text-gray-500">
                        Loading...
                      </div>
                    }>
                    <LazyContainerLogs params={params} />
                  </Loading>
                </Show>
              </TabsContent>
              <TabsContent value="files" class="h-full overflow-y-auto">
                <Show
                  when={container()?.State?.Status === ContainerStatus.RUNNING}
                  fallback={<ContainerNotFound />}>
                  <Loading
                    fallback={
                      <div class="h-full flex items-center justify-center text-gray-500">
                        Loading...
                      </div>
                    }>
                    <LazyContainerFiles />
                  </Loading>
                </Show>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
