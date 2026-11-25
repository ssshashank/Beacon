import { createMemo, For, Loading, Show } from "solid-js";
import { getImageHistoryByIDQuery } from "../queries";
import { formatBytes, formatTimeAgo } from "../mapper";
import { LayersIcon } from "../../../global/components/_icons/layers";

export interface ImageHistoryProps {
  id: string;
}

export default function ImageHistory(props: ImageHistoryProps) {
  const history = createMemo(() => getImageHistoryByIDQuery(props.id) ?? []);

  const cleanInstruction = (cmd?: string) => {
    if (!cmd) return "-";
    // Docker history instructions often prefix with "/bin/sh -c #(nop) "
    const nopPrefix = "/bin/sh -c #(nop) ";
    const shPrefix = "/bin/sh -c ";
    if (cmd.startsWith(nopPrefix)) {
      return cmd.slice(nopPrefix.length).trim();
    }
    if (cmd.startsWith(shPrefix)) {
      return cmd.slice(shPrefix.length).trim();
    }
    return cmd.trim();
  };

  return (
    <div class="rounded-md bg-[#0A0A0B] h-full overflow-y-auto">
      <div class="p-1 min-w-0">
        <Loading
          fallback={
            <div class="h-64 flex items-center justify-center text-gray-500">
              Loading image history...
            </div>
          }
        >
          <Show
            when={history().length > 0}
            fallback={
              <div class="h-64 flex flex-col items-center justify-center text-gray-500 text-sm">
                No layer history available
              </div>
            }
          >
            <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
              <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
                <LayersIcon size={14} color="#82f969" />
                <span class="text-md font-medium">Build History & Layers</span>
                <span class="text-xs text-neutral-500 font-mono ml-auto">
                  {history().length} steps
                </span>
              </div>

              <div class="pt-2 divide-y divide-neutral-800/60">
                <For each={history()}>
                  {(layer, index) => {
                    const stepNum = () => history().length - index();
                    const instruction = () => cleanInstruction(layer.CreatedBy);
                    const size = () => formatBytes(layer.Size || 0);
                    const timeAgo = () => formatTimeAgo(layer.Created);
                    const layerId = () => {
                      if (!layer.Id || layer.Id === "<missing>") return "<missing>";
                      return layer.Id.replace("sha256:", "").slice(0, 12);
                    };

                    return (
                      <div class="py-2.5 flex items-start gap-3 text-xs">
                        <span class="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono text-[11px] shrink-0 mt-0.5">
                          #{stepNum()}
                        </span>
                        <div class="min-w-0 flex-1">
                          <p class="font-mono text-neutral-200 text-xs break-all select-all leading-relaxed">
                            {instruction()}
                          </p>
                          <div class="flex items-center gap-3 mt-1 text-[11px] text-neutral-500 font-mono">
                            <span class="text-neutral-400">{size()}</span>
                            <span>·</span>
                            <span>{timeAgo()}</span>
                            <span>·</span>
                            <span class={layerId() === "<missing>" ? "text-neutral-600" : "text-neutral-400"}>
                              {layerId()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
          </Show>
        </Loading>
      </div>
    </div>
  );
}
