import { createMemo, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { InfoIcons } from "../../../global/components/_icons/info";
import { TagsIcon } from "../../../global/components/_icons/tag";
import { PortsIcon } from "../../../global/components/_icons/ports";
import { LayersIcon } from "../../../global/components/_icons/layers";
import { FileIcon } from "../../../global/components/_icons/file";
import { EjectIcon } from "../../../global/components/_icons/eject";
import { FolderIcon } from "../../../global/components/_icons/folder";
import { DiskIOIcons } from "../../../global/components/_icons/diskIO";
import { truncateLabel } from "../../containers/mapper";
import { formatBytes } from "../mapper";
import { listContainersQuery } from "../../containers/queries";

function ImageAbout(props: {
  fullId: () => string;
  tag: () => string;
  size: () => string;
  platform: () => string;
  createdDate: () => string;
  dockerVersion: () => string;
  author: () => string;
}) {
  return (
    <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
      <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
        <InfoIcons size={14} color="#3277f8" />
        <span class="text-md font-medium">About</span>
      </div>
      <div class="text-gray-200 pt-2">
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">ID:</span>
          <span class="truncate [direction:rtl] text-left max-w-[200px]" title={props.fullId()}>
            &lrm;{props.fullId()}
          </span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">Tag:</span>
          <span class="truncate max-w-[260px]" title={props.tag()}>
            {props.tag()}
          </span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">Size:</span>
          <span>{props.size()}</span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">Platform:</span>
          <span>{props.platform()}</span>
        </div>
        <Show when={props.dockerVersion() && props.dockerVersion() !== "-"}>
          <div class="flex items-center justify-between py-1">
            <span class="text-gray-400">Docker Version:</span>
            <span>{props.dockerVersion()}</span>
          </div>
        </Show>
        <Show when={props.author() && props.author() !== "-"}>
          <div class="flex items-center justify-between py-1">
            <span class="text-gray-400">Author:</span>
            <span class="truncate max-w-[260px]" title={props.author()}>
              {props.author()}
            </span>
          </div>
        </Show>
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">Created At:</span>
          <span>{props.createdDate()}</span>
        </div>
      </div>
    </div>
  );
}

function ImageConfig(props: {
  cmd: () => string;
  entrypoint: () => string;
  workingDir: () => string;
  user: () => string;
  stopSignal: () => string;
}) {
  return (
    <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
      <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
        <LayersIcon size={14} color="#82f969" />
        <span class="text-md font-medium">Config</span>
      </div>
      <div class="text-gray-200 pt-2">
        <Show when={props.cmd() && props.cmd() !== "-"}>
          <div class="flex items-center justify-between py-1">
            <span class="text-gray-400">Command (CMD):</span>
            <span class="truncate max-w-[300px] font-mono text-xs sm:text-sm text-neutral-300" title={props.cmd()}>
              {props.cmd()}
            </span>
          </div>
        </Show>
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">Entrypoint:</span>
          <span class="truncate max-w-[300px] font-mono text-xs sm:text-sm text-neutral-300" title={props.entrypoint()}>
            {props.entrypoint()}
          </span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">Working Directory:</span>
          <span class="font-mono text-xs sm:text-sm text-neutral-300">{props.workingDir()}</span>
        </div>
        <Show when={props.user() && props.user() !== "-"}>
          <div class="flex items-center justify-between py-1">
            <span class="text-gray-400">User:</span>
            <span>{props.user()}</span>
          </div>
        </Show>
        <Show when={props.stopSignal() && props.stopSignal() !== "-"}>
          <div class="flex items-center justify-between py-1">
            <span class="text-gray-400">Stop Signal:</span>
            <span>{props.stopSignal()}</span>
          </div>
        </Show>
      </div>
    </div>
  );
}

function ImagePorts(props: { ports: () => string[] }) {
  return (
    <Show when={props.ports().length > 0}>
      <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
        <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
          <PortsIcon size={14} color="#82f969" />
          <span class="text-md font-medium">Port Forwards</span>
        </div>
        <div class="text-gray-200 pt-2">
          <div class="grid grid-cols-2 gap-4 py-1 text-gray-400 font-medium">
            <span>Port</span>
            <span class="text-right">Protocol</span>
          </div>
          <For each={props.ports()}>
            {(port) => {
              const [portNum, protocol] = port.split("/");
              return (
                <div class="grid grid-cols-2 gap-4 py-1 items-center">
                  <span class="text-blue-500 font-mono">{portNum}</span>
                  <span class="text-neutral-400 uppercase text-right font-mono">{protocol ?? "tcp"}</span>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </Show>
  );
}

function ImageVolumes(props: { volumes: () => string[] }) {
  return (
    <Show when={props.volumes().length > 0}>
      <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
        <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
          <FolderIcon size={14} color="#f59e0b" />
          <span class="text-md font-medium">Declared Volumes</span>
        </div>
        <div class="text-gray-200 pt-2">
          <For each={props.volumes()}>
            {(vol) => (
              <div class="flex items-center justify-between py-1">
                <span class="text-gray-400">Volume:</span>
                <span class="text-neutral-300 font-mono text-xs">{vol}</span>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}

function ImageStorage(props: {
  driver: () => string;
  layersCount: () => number;
  layers: () => string[];
}) {
  return (
    <Show when={props.layersCount() > 0 || (props.driver() && props.driver() !== "-")}>
      <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
        <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
          <DiskIOIcons size={14} color="#a855f7" />
          <span class="text-md font-medium">Storage & Layers</span>
        </div>
        <div class="text-gray-200 pt-2">
          <Show when={props.driver() && props.driver() !== "-"}>
            <div class="flex items-center justify-between py-1">
              <span class="text-gray-400">Storage Driver:</span>
              <span class="font-mono text-xs text-neutral-300">{props.driver()}</span>
            </div>
          </Show>
          <div class="flex items-center justify-between py-1">
            <span class="text-gray-400">Total Layers:</span>
            <span>{props.layersCount()} layers</span>
          </div>
          <Show when={props.layers().length > 0}>
            <div class="pt-2">
              <span class="text-xs text-gray-400 font-medium block mb-1">RootFS Layer Hashes:</span>
              <div class="space-y-1">
                <For each={props.layers()}>
                  {(layer, idx) => (
                    <div class="flex items-center justify-between text-xs py-0.5">
                      <span class="text-gray-500 font-mono">#{idx() + 1}</span>
                      <span class="font-mono text-neutral-400 truncate max-w-[85%]" title={layer}>
                        {layer}
                      </span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}

function ImageUsedBy(props: { containers: () => Array<{ id: string; name: string; status?: string }> }) {
  const navigate = useNavigate();

  return (
    <Show when={props.containers().length > 0}>
      <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
        <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
          <EjectIcon size={14} color="#EB3362" />
          <span class="text-md font-medium">Used By</span>
        </div>
        <div class="text-gray-200 pt-2">
          <div class="grid grid-cols-2 gap-4 py-1 text-gray-400 font-medium">
            <span>Container</span>
            <span class="text-right">Status</span>
          </div>
          <For each={props.containers()}>
            {(c) => (
              <div
                onClick={() => navigate(`/containers/${c.id}`)}
                class="grid grid-cols-2 gap-4 py-1 items-center cursor-pointer hover:bg-neutral-800/40 rounded px-1 -mx-1 transition-colors"
                title="View container details"
              >
                <span class="text-blue-400 hover:text-blue-300 truncate font-medium">{c.name}</span>
                <span class="text-right truncate text-gray-300 text-xs uppercase">{c.status ?? "running"}</span>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}

function ImageEnvironment(props: { envList: () => Array<{ key: string; value: string }> }) {
  return (
    <Show when={props.envList().length > 0}>
      <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
        <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
          <FileIcon size={14} color="#38bdf8" />
          <span class="text-md font-medium">Environment</span>
        </div>
        <div class="text-gray-200 pt-2">
          <div class="grid grid-cols-2 gap-4 py-1 text-gray-400 font-medium">
            <span>Key</span>
            <span class="text-right">Value</span>
          </div>
          <For each={props.envList()}>
            {(item) => (
              <div class="grid grid-cols-2 gap-4 py-1">
                <span class="text-gray-400 break-all" title={item.key}>
                  {item.key}
                </span>
                <span class="text-right truncate font-mono text-gray-300" title={item.value}>
                  {truncateLabel(item.key, item.value)}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}

function ImageLabels(props: { labelList: () => Array<[string, string]> }) {
  return (
    <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
      <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
        <TagsIcon size={14} color="#f8ac29" />
        <span class="text-md font-medium">Labels</span>
      </div>
      <div class="text-gray-200 pt-2">
        <Show
          when={props.labelList().length > 0}
          fallback={<p class="text-neutral-500 py-2 text-center">No labels found</p>}
        >
          <div class="grid grid-cols-2 gap-4 py-1 text-gray-400 font-medium">
            <span>Key</span>
            <span class="text-right">Value</span>
          </div>
          <For each={props.labelList()}>
            {([key, value]) => (
              <div class="grid grid-cols-2 gap-4 py-1">
                <span class="text-gray-400 break-all" title={key}>
                  {key}
                </span>
                <span class="text-right truncate" title={value}>
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

export default function ImageInfo(props: {
  inspect: () => any;
  initialImage?: any;
  paramsId?: string;
}) {
  const data = createMemo(() => props.inspect() ?? {});
  const fallback = () => props.initialImage ?? {};

  const fullId = createMemo(() => {
    return data()?.Id || fallback()?.id || props.paramsId || "";
  });

  const tag = createMemo(() => {
    const repoTags: string[] = data()?.RepoTags || fallback()?.repo_tags || [];
    if (repoTags.length > 0) return repoTags.join(", ");
    if (fallback()?.name && fallback()?.tag) return `${fallback().name}:${fallback().tag}`;
    return fallback()?.name || "<none>";
  });

  const size = createMemo(() => {
    const s = data()?.Size || data()?.VirtualSize || fallback()?.size || 0;
    return formatBytes(s);
  });

  const platform = createMemo(() => {
    const os = data()?.Os || fallback()?.os || "linux";
    const arch = data()?.Architecture || fallback()?.architecture || "arm64";
    return `${os}/${arch}`;
  });

  const createdDate = createMemo(() => {
    const raw = data()?.Created || fallback()?.created;
    if (!raw) return "-";
    const d = typeof raw === "number" ? new Date(raw * 1000) : new Date(raw);
    if (isNaN(d.getTime())) return String(raw);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  });

  const dockerVersion = createMemo(() => {
    return data()?.DockerVersion || "-";
  });

  const author = createMemo(() => {
    return data()?.Author || "-";
  });

  const cmd = createMemo(() => {
    const c = data()?.Config?.Cmd || data()?.ContainerConfig?.Cmd;
    if (Array.isArray(c)) return c.join(" ");
    if (typeof c === "string" && c.trim()) return c;
    return "-";
  });

  const entrypoint = createMemo(() => {
    const ep = data()?.Config?.Entrypoint || data()?.ContainerConfig?.Entrypoint;
    if (Array.isArray(ep)) return ep.join(" ");
    if (typeof ep === "string" && ep.trim()) return ep;
    return "-";
  });

  const workingDir = createMemo(() => {
    return data()?.Config?.WorkingDir || data()?.ContainerConfig?.WorkingDir || "-";
  });

  const user = createMemo(() => {
    return data()?.Config?.User || data()?.ContainerConfig?.User || "-";
  });

  const stopSignal = createMemo(() => {
    return data()?.Config?.StopSignal || data()?.ContainerConfig?.StopSignal || "-";
  });

  const envList = createMemo(() => {
    const raw = data()?.Config?.Env || data()?.ContainerConfig?.Env || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((item: string) => {
      const idx = item.indexOf("=");
      if (idx === -1) return { key: item, value: "" };
      return { key: item.slice(0, idx), value: item.slice(idx + 1) };
    });
  });

  const labelList = createMemo(() => {
    const raw = data()?.Config?.Labels || data()?.ContainerConfig?.Labels || fallback()?.labels || {};
    return Object.entries(raw).map(([k, v]) => [k, String(v ?? "")] as [string, string]);
  });

  const exposedPorts = createMemo(() => {
    const portsObj = data()?.Config?.ExposedPorts || data()?.ContainerConfig?.ExposedPorts || {};
    return Object.keys(portsObj);
  });

  const volumes = createMemo(() => {
    const volsObj = data()?.Config?.Volumes || data()?.ContainerConfig?.Volumes || {};
    return Object.keys(volsObj);
  });

  const storageDriver = createMemo(() => {
    return data()?.GraphDriver?.Name || "-";
  });

  const rootFsLayers = createMemo(() => {
    const layers = data()?.RootFS?.Layers;
    return Array.isArray(layers) ? layers : [];
  });

  const allContainers = createMemo(() => listContainersQuery() ?? []);
  const usedByContainers = createMemo(() => {
    const targetId = fullId();
    const shortTargetId = targetId.replace("sha256:", "").slice(0, 12);
    const tags = data()?.RepoTags || fallback()?.repo_tags || [];
    const matched: Array<{ id: string; name: string; status?: string }> = [];
    const seen = new Set<string>();

    for (const group of allContainers()) {
      for (const c of group.containers ?? []) {
        const cImg = c.image || "";
        const cImgShort = cImg.replace("sha256:", "").slice(0, 12);
        if (
          (targetId && (cImg.includes(targetId) || targetId.includes(cImg))) ||
          (shortTargetId && (cImg.includes(shortTargetId) || cImgShort === shortTargetId)) ||
          tags.some((t: string) => t === cImg || cImg === t.split(":")[0])
        ) {
          if (!seen.has(c.name)) {
            seen.add(c.name);
            matched.push({ id: c.id, name: c.name, status: c.status });
          }
        }
      }
    }
    return matched;
  });

  return (
    <div class="rounded-md bg-[#0A0A0B] h-full overflow-y-auto">
      <div class="p-1 grid grid-cols-1 gap-2 items-start w-full min-w-0">
        <ImageAbout
          fullId={fullId}
          tag={tag}
          size={size}
          platform={platform}
          createdDate={createdDate}
          dockerVersion={dockerVersion}
          author={author}
        />
        <ImageConfig
          cmd={cmd}
          entrypoint={entrypoint}
          workingDir={workingDir}
          user={user}
          stopSignal={stopSignal}
        />
        <ImagePorts ports={exposedPorts} />
        <ImageVolumes volumes={volumes} />
        <ImageStorage
          driver={storageDriver}
          layersCount={() => rootFsLayers().length}
          layers={rootFsLayers}
        />
        <ImageUsedBy containers={usedByContainers} />
        <ImageEnvironment envList={envList} />
        <ImageLabels labelList={labelList} />
      </div>
    </div>
  );
}
