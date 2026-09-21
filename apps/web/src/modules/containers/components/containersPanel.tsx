import { createMemo, For, Loading, Show } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { listContainersQuery } from "../queries";
import { createBGColorGenerator } from "../../../global/reactivity/createBgColor";
import { LayersIcon } from "../../../global/components/_icons/layers";
import { BoxIcons } from "../../../global/components/_icons/box";
import { Accordion, AccordionItem } from "../../../global/components/_common/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../global/components/_common/tabs";
import { ContainerStatus } from "../constant";
import type { ComposeDTO } from "../types";
import allContainersSvg from "~/assets/_svgs/allContainers.svg";
import activeContainersSvg from "~/assets/_svgs/activeContainers.svg";
import { isSidebarRouteActive } from "../../../global/utils/route";
import { StatusDot } from "../../../global/components/_common/statusDot";

function ComposeList(props: { composes: ComposeDTO[]; emptyIcon: string; emptyMessage: string }) {
  const location = useLocation();
  const isActiveRoute = (path: string) => isSidebarRouteActive(location.pathname, path);
  const navigate = useNavigate();

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
            return (
              <AccordionItem
                open={true}
                title={
                  <div class="flex items-center justify-start gap-3">
                    <div class="h-7 w-7 flex items-center justify-center rounded text-md font-medium">
                      <LayersIcon color={hexColor()} />
                    </div>
                    <span class="text-sm text-text-primary truncate">{compose.label}</span>
                  </div>
                }>
                <ul>
                  <For each={compose?.containers}>
                    {(c, index) => {
                      const [hexColor] = createBGColorGenerator(c.name);
                      const isActive = createMemo(() => isActiveRoute(`/containers/${c?.id}`));

                      return (
                        <li
                          onClick={() => navigate(`/containers/${c?.id}`, {
                            state: { container: c, color: hexColor() }
                          })}
                          class={`p-1 cursor-pointer ${index() < compose?.containers?.length! - 1 ? 'border-b-[0.03px] border-neutral-800' : ''}`}>
                          <div class={`p-2 rounded-md flex items-center justify-start gap-3 ${isActive() ? 'bg-[#3B3B3B80]' : ''}`}>
                            <div class="h-8 w-8 rounded flex items-center justify-center"
                              style={{
                                color: hexColor()
                              }}>
                              <BoxIcons size={16} />
                            </div>
                            <div class='flex items-center justify-between w-full'>
                              <div class="w-full max-w-[150px] overflow-hidden">
                                <p class='text-white text-sm'>{c.name}</p>
                                <p class="truncate [direction:rtl] text-left text-xs text-gray-500">
                                  &lrm;{c?.image}
                                </p>
                              </div>
                              <Show when={c?.status === ContainerStatus.RUNNING}>
                                <StatusDot status={c?.status!} size={10} />
                              </Show>
                            </div>
                          </div>
                        </li>
                      );
                    }}
                  </For>
                </ul>
              </AccordionItem>
            )
          }}
        </For>
      </Accordion>
    </Show>
  );
}

export default function ContainersSidebarPanel(props: any) {
  const composes = createMemo(() => listContainersQuery() ?? []);
  const activeComposes = createMemo(() => composes()?.filter((c) => c?.status === ContainerStatus.RUNNING));
  const inactiveComposes = createMemo(() => composes()?.filter((c) => c?.status === ContainerStatus.EXITED));

  return (
    <div class="flex-1 h-full p-2">
      <div class="h-full">
        <div class='border-b-[0.03px] border-neutral-800 pb-2 flex items-center justify-between'>
          <span class="text-md">
            {props.label ?? ""}
          </span>
        </div>
        <Tabs defaultValue="all">
          <TabsList style="mt-3 bg-[#151619] p-1 rounded-md gap-1" indicatorStyle="bg-[#3B3B3B80]">
            <TabsTrigger value="all" style="flex-1 flex  flex-row items-center justify-center gap-3 text-center">
              <span class='text-blue-300'>All</span>
            </TabsTrigger>
            <TabsTrigger value="running" style="flex-1 flex flex-row items-center justify-center gap-3 text-center">
              <span class='text-green-300'>Running</span>
            </TabsTrigger>
            <TabsTrigger value="exited" style="flex-1 flex flex-row items-center justify-center gap-3 text-center">
              <span class='text-red-300'>Exited</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Loading>
              <ComposeList composes={[...activeComposes(), ...inactiveComposes()]} emptyIcon={allContainersSvg} emptyMessage="No containers found" />
            </Loading>
          </TabsContent>
          <TabsContent value="running">
            <Loading>
              <ComposeList composes={activeComposes()} emptyIcon={activeContainersSvg} emptyMessage="No active containers running" />
            </Loading>
          </TabsContent>
          <TabsContent value="exited">
            <Loading>
              <ComposeList composes={inactiveComposes()} emptyIcon={activeContainersSvg} emptyMessage="No active containers running" />
            </Loading>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
