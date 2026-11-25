import { createMemo, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { InfoIcons } from "../../../global/components/_icons/info";
import { TagsIcon } from "../../../global/components/_icons/tag";
import { NetworkIcons } from "../../../global/components/_icons/network";
import { EjectIcon } from "../../../global/components/_icons/eject";
import { LayersIcon } from "../../../global/components/_icons/layers";
import { truncateLabel } from "../../containers/mapper";
import { formatNetworkCreatedAt } from "../mapper";

function NetworkAbout(props: {
  id: () => string;
  name: () => string;
  driver: () => string;
  scope: () => string;
  createdAt: () => string;
  internal: () => string;
  attachable: () => string;
  enableIPv6: () => string;
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
          <span class="font-mono text-neutral-300 truncate max-w-[280px]" title={props.id()}>
            {props.id().slice(0, 12)}
          </span>
        </div>
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
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">Internal:</span>
          <span>{props.internal()}</span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">Attachable:</span>
          <span>{props.attachable()}</span>
        </div>
        <div class="flex items-center justify-between py-1">
          <span class="text-gray-400">IPv6:</span>
          <span>{props.enableIPv6()}</span>
        </div>
      </div>
    </div>
  );
}

function NetworkSubnets(props: { ipamConfigs: () => Array<{ subnet?: string; gateway?: string }> }) {
  return (
    <Show when={props.ipamConfigs().length > 0}>
      <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
        <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
          <NetworkIcons size={14} color="#82f969" />
          <span class="text-md font-medium">Subnet & IPAM</span>
        </div>
        <div class="text-gray-200 pt-2">
          <div class="grid grid-cols-2 gap-4 py-1 text-gray-400 font-medium">
            <span>Subnet</span>
            <span class="text-right">Gateway</span>
          </div>
          <For each={props.ipamConfigs()}>
            {(ipam) => (
              <div class="grid grid-cols-2 gap-4 py-1 font-mono text-xs sm:text-sm">
                <span class="text-blue-400">{ipam.subnet || "-"}</span>
                <span class="text-right text-neutral-300">{ipam.gateway || "-"}</span>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}

function NetworkContainers(props: {
  containers: () => Array<{
    id: string;
    name: string;
    ipv4: string;
    mac: string;
  }>;
}) {
  const navigate = useNavigate();

  return (
    <Show when={props.containers().length > 0}>
      <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
        <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
          <EjectIcon size={14} color="#EB3362" />
          <span class="text-md font-medium">Connected Containers</span>
        </div>
        <div class="text-gray-200 pt-2 space-y-1">
          <div class="grid grid-cols-3 gap-2 py-1 text-gray-400 font-medium text-xs">
            <span>Container</span>
            <span class="text-center">IPv4 Address</span>
            <span class="text-right">MAC Address</span>
          </div>
          <For each={props.containers()}>
            {(c) => (
              <div
                onClick={() => navigate(`/containers/${c.id}`)}
                class="grid grid-cols-3 gap-2 py-1.5 cursor-pointer hover:bg-neutral-800/40 rounded px-1 -mx-1 transition-colors group items-center"
                title={`View container ${c.name} details`}
              >
                <span class="text-blue-400 group-hover:text-blue-300 font-medium font-mono text-xs sm:text-sm truncate">
                  {c.name.replace(/^\//, "")}
                </span>
                <span class="text-center font-mono text-xs text-neutral-300 truncate">
                  {c.ipv4 || "-"}
                </span>
                <span class="text-right font-mono text-xs text-gray-500 truncate">
                  {c.mac || "-"}
                </span>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}

function NetworkOptions(props: { options: () => Record<string, string> }) {
  const optionsList = createMemo(() => Object.entries(props.options() ?? {}));

  return (
    <Show when={optionsList().length > 0}>
      <div class="h-fit rounded bg-[#151619] p-3 min-w-0">
        <div class="flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700">
          <LayersIcon size={14} color="#f59e0b" />
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

function NetworkLabels(props: { labelList: () => Array<[string, string]> }) {
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

export default function NetworkInfo(props: {
  inspect: () => any;
  initialNetwork?: any;
  paramsId?: string;
}) {
  const data = createMemo(() => props.inspect() ?? {});
  const fallback = () => props.initialNetwork ?? {};

  const id = createMemo(() => {
    return data()?.Id || fallback()?.id || props.paramsId || "";
  });

  const name = createMemo(() => {
    return data()?.Name || fallback()?.name || "";
  });

  const driver = createMemo(() => {
    return data()?.Driver || fallback()?.driver || "bridge";
  });

  const scope = createMemo(() => {
    return data()?.Scope || fallback()?.scope || "local";
  });

  const createdAt = createMemo(() => {
    const raw = data()?.Created || fallback()?.created;
    return formatNetworkCreatedAt(raw);
  });

  const internal = createMemo(() => {
    const v = data()?.Internal ?? fallback()?.internal;
    return v ? "Yes" : "No";
  });

  const attachable = createMemo(() => {
    const v = data()?.Attachable ?? fallback()?.attachable;
    return v ? "Yes" : "No";
  });

  const enableIPv6 = createMemo(() => {
    const v = data()?.EnableIPv6 ?? fallback()?.enable_ipv6;
    return v ? "Enabled" : "Disabled";
  });

  const ipamConfigs = createMemo(() => {
    const raw = data()?.IPAM?.Config || fallback()?.ipam || [];
    if (!Array.isArray(raw)) return [];
    return raw.map((c: any) => ({
      subnet: c.Subnet || c.subnet,
      gateway: c.Gateway || c.gateway,
    }));
  });

  const connectedContainers = createMemo(() => {
    const containersObj = data()?.Containers || fallback()?.containers || {};
    return Object.entries(containersObj).map(([cid, val]: [string, any]) => ({
      id: cid,
      name: val.Name || val.name || cid.slice(0, 12),
      ipv4: val.IPv4Address || val.ipv4_address || "-",
      mac: val.MacAddress || val.mac_address || "-",
    }));
  });

  const options = createMemo(() => {
    return data()?.Options || fallback()?.options || {};
  });

  const labelList = createMemo(() => {
    const raw = data()?.Labels || fallback()?.labels || {};
    return Object.entries(raw).map(([k, v]) => [k, String(v ?? "")] as [string, string]);
  });

  return (
    <div class="rounded-md bg-[#0A0A0B] h-full overflow-y-auto">
      <div class="p-1 grid grid-cols-1 gap-2 items-start w-full min-w-0">
        <NetworkAbout
          id={id}
          name={name}
          driver={driver}
          scope={scope}
          createdAt={createdAt}
          internal={internal}
          attachable={attachable}
          enableIPv6={enableIPv6}
        />
        <NetworkSubnets ipamConfigs={ipamConfigs} />
        <NetworkContainers containers={connectedContainers} />
        <NetworkOptions options={options} />
        <NetworkLabels labelList={labelList} />
      </div>
    </div>
  );
}
