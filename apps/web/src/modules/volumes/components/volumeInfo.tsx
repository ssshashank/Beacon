import { createMemo, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { InfoIcons } from "../../../global/components/_icons/info";
import { TagsIcon } from "../../../global/components/_icons/tag";
import { FolderIcon } from "../../../global/components/_icons/folder";
import { EjectIcon } from "../../../global/components/_icons/eject";
import { LayersIcon } from "../../../global/components/_icons/layers";
import { truncateLabel } from "../../containers/mapper";
import { formatBytes, formatVolumeCreatedAt } from "../mapper";
import { listContainersQuery } from "../../containers/queries";

function VolumeAbout(props: {
  name: () => string;
  driver: () => string;
  scope: () => string;
  createdAt: () => string;
  size: () => string;
  refCount: () => string;
}) {
  return (
    <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
      <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
        <InfoIcons size={14} color="#3277f8" />
        <span class="text-md font-medium">About</span>
      </div>
      <div class="text-gray-200 pt-2">
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">Name:</span>
          <span class="font-mono text-neutral-200 truncate max-w-[280px]" title={props.name()}>
            {props.name()}
          </span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">Driver:</span>
          <span class="font-mono text-neutral-300">{props.driver()}</span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">Scope:</span>
          <span class="font-mono text-neutral-300">{props.scope()}</span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">Created:</span>
          <span>{props.createdAt()}</span>
        </div>
        <Show when={props.size() && props.size() !== "0 B"}>
          <div class="flex items-center justify-between py-1">
            <span class="text-gray-400">Size:</span>
            <span>{props.size()}</span>
          </div>
        </Show>
        <Show when={props.refCount() && props.refCount() !== "-"}>
          <div class="flex items-center justify-between py-1">
            <span class="text-gray-400">Ref Count:</span>
            <span>{props.refCount()}</span>
          </div>
        </Show>
      </div>
    </div>
  );
}

function VolumeMountpoint(props: { mountpoint: () => string }) {
  return (
    <Show when={props.mountpoint()}>
      <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
        <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
          <FolderIcon size={14} color="#f59e0b" />
          <span class="text-md font-medium">Mountpoint</span>
        </div>
        <div class="text-gray-200 pt-2">
          <div class="py-1 font-mono text-xs sm:text-sm text-neutral-300 break-all select-all">
            {props.mountpoint()}
          </div>
        </div>
      </div>
    </Show>
  );
}

function VolumeUsedBy(props: { containers: () => Array<{ id: string; name: string; status?: string; destination?: string }> }) {
  const navigate = useNavigate();

  return (
    <Show when={props.containers().length > 0}>
      <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
        <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
          <EjectIcon size={14} color="#EB3362" />
          <span class="text-md font-medium">Used By</span>
        </div>
        <div class="text-gray-200 pt-2 space-y-1">
          <For each={props.containers()}>
            {(c) => (
              <div
                onClick={() => navigate(`/containers/${c.id}`)}
                class="flex items-center justify-between py-1 cursor-pointer hover:bg-neutral-800/40 rounded px-1 -mx-1 transition-colors group"
                title={`View container ${c.name} details`}
              >
                <div>
                  <span class="text-blue-400 group-hover:text-blue-300 font-medium font-mono text-sm block">
                    {c.name.replace(/^\//, "")}
                  </span>
                  <Show when={c.destination}>
                    <span class="text-[11px] text-gray-500 font-mono block">
                      mounted at {c.destination}
                    </span>
                  </Show>
                </div>
                <span class="text-right text-gray-400 text-xs uppercase font-mono">
                  {c.status ?? "running"}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}

function VolumeOptions(props: { options: () => Record<string, string> }) {
  const optionsList = createMemo(() => Object.entries(props.options() ?? {}));

  return (
    <Show when={optionsList().length > 0}>
      <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
        <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
          <LayersIcon size={14} color="#82f969" />
          <span class="text-md font-medium">Driver Options</span>
        </div>
        <div class="text-gray-200 pt-2">
          <div class="grid grid-cols-2 gap-4 py-1 text-gray-400 font-medium">
            <span>Key</span>
            <span class="text-right">Value</span>
          </div>
          <For each={optionsList()}>
            {([key, value]) => (
              <div class="grid grid-cols-2 gap-4 py-1">
                <span class="text-gray-400 break-all font-mono text-xs sm:text-sm" title={key}>
                  {key}
                </span>
                <span class="text-right truncate font-mono text-xs sm:text-sm text-gray-300" title={value}>
                  {value}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}

function VolumeLabels(props: { labelList: () => Array<[string, string]> }) {
  return (
    <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
      <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
        <TagsIcon size={14} color="#f8ac29" />
        <span class="text-md font-medium">Labels</span>
      </div>
      <div class="text-gray-200 pt-2">
        <Show
          when={props.labelList().length > 0}
          fallback={<p class="text-neutral-500 py-2 text-center text-sm">No labels found</p>}
        >
          <div class="grid grid-cols-2 gap-4 py-1 text-gray-400 font-medium">
            <span>Key</span>
            <span class="text-right">Value</span>
          </div>
          <For each={props.labelList()}>
            {([key, value]) => (
              <div class="grid grid-cols-2 gap-4 py-1">
                <span class="text-gray-400 break-all font-mono text-xs sm:text-sm" title={key}>
                  {key}
                </span>
                <span class="text-right truncate font-mono text-xs sm:text-sm text-gray-300" title={value}>
                  {truncateLabel(key, value)}
                </span>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}

export default function VolumeInfo(props: {
  inspect: () => any;
  initialVolume?: any;
  paramsName?: string;
}) {
  const data = createMemo(() => props.inspect() ?? {});
  const fallback = () => props.initialVolume ?? {};

  const name = createMemo(() => {
    return data()?.Name || fallback()?.name || props.paramsName || "";
  });

  const driver = createMemo(() => {
    return data()?.Driver || fallback()?.driver || "local";
  });

  const scope = createMemo(() => {
    return data()?.Scope || fallback()?.scope || "local";
  });

  const mountpoint = createMemo(() => {
    return data()?.Mountpoint || fallback()?.mountpoint || "";
  });

  const createdAt = createMemo(() => {
    const raw = data()?.CreatedAt || fallback()?.created_at;
    return formatVolumeCreatedAt(raw);
  });

  const size = createMemo(() => {
    const s = data()?.UsageData?.Size ?? fallback()?.size ?? 0;
    return formatBytes(s);
  });

  const refCount = createMemo(() => {
    const r = data()?.UsageData?.RefCount ?? fallback()?.ref_count;
    return r !== undefined && r !== null ? String(r) : "-";
  });

  const options = createMemo(() => {
    return data()?.Options || fallback()?.options || {};
  });

  const labelList = createMemo(() => {
    const raw = data()?.Labels || fallback()?.labels || {};
    return Object.entries(raw).map(([k, v]) => [k, String(v ?? "")] as [string, string]);
  });

  const allContainers = createMemo(() => listContainersQuery() ?? []);
  const usedByContainers = createMemo(() => {
    const volName = name();
    if (!volName) return [];
    const matched: Array<{ id: string; name: string; status?: string; destination?: string }> = [];
    const seen = new Set<string>();

    for (const group of allContainers()) {
      for (const c of group.containers ?? []) {
        const mounts = c.mounts ?? (c as any).Mounts ?? [];
        for (const m of mounts) {
          const mName = m.name || (m as any).Name || "";
          const mSrc = m.source || (m as any).Source || "";
          if (mName === volName || mSrc === volName || mSrc.endsWith(`/${volName}`)) {
            if (!seen.has(c.name)) {
              seen.add(c.name);
              matched.push({
                id: c.id,
                name: c.name,
                status: c.status,
                destination: m.destination || (m as any).Destination,
              });
            }
          }
        }
      }
    }
    return matched;
  });

  return (
    <div class="rounded-md bg-[#0A0A0B] h-full overflow-y-auto">
      <div class="p-1 grid grid-cols-1 gap-2 items-start w-full min-w-0">
        <VolumeAbout
          name={name}
          driver={driver}
          scope={scope}
          createdAt={createdAt}
          size={size}
          refCount={refCount}
        />
        <VolumeMountpoint mountpoint={mountpoint} />
        <VolumeUsedBy containers={usedByContainers} />
        <VolumeOptions options={options} />
        <VolumeLabels labelList={labelList} />
      </div>
    </div>
  );
}
