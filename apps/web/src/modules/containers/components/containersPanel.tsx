import { createMemo, For, Loading, Show } from "solid-js";
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

function ComposeList(props: { composes: ComposeDTO[]; emptyIcon: string; emptyMessage: string }) {
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
        <For each={props.composes}>
          {(container, index) => {
            const [hexColor] = createBGColorGenerator(container.label);

            return (
              <AccordionItem
                open={index() === 0}
                title={
                  <div class="flex items-center justify-start gap-3">
                    <div class="h-7 w-7 flex items-center justify-center rounded text-md font-medium">
                      <LayersIcon color={hexColor()} />
                    </div>
                    <span class="text-sm text-text-primary truncate">{container.label}</span>
                  </div>
                }>
                <ul>
                  <For each={container?.containers}>
                    {(c, index) => {
                      const [hexColor] = createBGColorGenerator(c.name);
                      return (
                        <li class={`${index() < container?.containers?.length! - 1 ? 'my-1 border-b-[0.03px] border-neutral-700 py-2' : 'pt-2'} hover:bg-[#151619] cursor-pointer rounded-t-md`}>
                          <div class='flex items-center justify-start gap-3'>
                            <div class="h-8 w-8 rounded flex items-center justify-center"
                              style={{
                                color: hexColor()
                              }}>
                              <BoxIcons size={16} />
                            </div>
                            <div>
                              <p class='text-white text-sm'>{c.name}</p>
                              <div class="w-full max-w-[150px] overflow-hidden">
                                <p class="truncate [direction:rtl] text-left text-xs text-gray-500">
                                  &lrm;{c?.image}
                                </p>
                              </div>
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

  const activeComposes = createMemo(() =>
    composes()
      .map((compose) => ({
        ...compose,
        containers: compose.containers?.filter((c) => c.status === ContainerStatus.RUNNING),
      }))
      .filter((compose) => (compose.containers?.length ?? 0) > 0)
  );

  return (
    <div class="flex-1 h-full border-l-[0.03px] border-neutral-800 p-2">
      <div class="h-full">
        <div class='border-b-[0.03px] border-neutral-700 pb-2 flex items-center justify-between'>
          <span class="text-xl">
            {props.label ?? ""}
          </span>
        </div>
        <Tabs defaultValue="all">
          <TabsList style="mt-3 bg-[#0c0c0d] p-1 rounded-md gap-1">
            <TabsTrigger value="all" style="flex-1 text-center">All</TabsTrigger>
            <TabsTrigger value="active" style="flex-1 text-center">Active</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Loading>
              <ComposeList composes={composes()} emptyIcon={allContainersSvg} emptyMessage="No containers found" />
            </Loading>
          </TabsContent>

          <TabsContent value="active">
            <Loading>
              <ComposeList composes={activeComposes()} emptyIcon={activeContainersSvg} emptyMessage="No active containers running" />
            </Loading>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
