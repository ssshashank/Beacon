import { createMemo, For, Loading, Show } from "solid-js";
import { InfoIcons } from "../../../global/components/_icons/info";
import { StatusLabel } from "../../../global/components/_common/statusDot";
import { TagsIcon } from "../../../global/components/_icons/tag";
import { truncateLabel } from "../mapper";
import { PortsIcon } from "../../../global/components/_icons/ports";
import { EjectIcon } from "../../../global/components/_icons/eject";
import Copyable from "../../../global/components/_common/copyable";

function ContainerAbout(props: any) {
  const aboutRows = [
    {
      label: "Name:",
      value: () => props.container()?.name,
    },
    {
      label: "ID:",
      value: () => props.container()?.id,
      display: () => `\u200E${props.container()?.id}`,
      textClass: "truncate [direction:rtl] text-left max-w-[150px]",
    },
    {
      label: "Image:",
      value: () => props.container()?.image?.name,
      display: () => truncateLabel("image", props.container()?.image?.name as string),
    },
    {
      label: "Command:",
      value: () => props.container()?.command,
      textClass: "truncate max-w-[200px]",
    },
  ];

  return (
    <div class='h-fit rounded bg-[#151619] p-3 min-w-0'>
      <div class='flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <InfoIcons size={14} color="#3277f8" />
        <span class='text-md font-medium'>About</span>
      </div>
      <div class="text-gray-200 pt-2">
        <For each={aboutRows}>
          {(row) => (
            <div class='flex items-center justify-between py-1 group'>
              <span class='text-gray-400'>{row.label}</span>
              <Copyable
                value={row.value()}
                display={row.display?.()}
                textClass={row.textClass}
              />
            </div>
          )}
        </For>
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            State:
          </span>
          <StatusLabel status={props.container()?.status} />
        </div>
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            Started At:
          </span>
          <span>
            {props.container()?.up_status
              ? new Date(props.container()?.up_status).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })
              : "-"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ContainerLabels(props: any) {
  return (
    <div class='h-fit rounded bg-[#151619] p-3 min-w-0'>
      <div class='flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <TagsIcon size={14} color="#f8ac29" />
        <span class='text-md font-medium'>Labels</span>
      </div>
      <div class="text-gray-200 pt-2">
        <Show
          when={Object.keys(props.container()?.label ?? {}).length > 0}
          fallback={<p class="text-neutral-500 py-2 text-center">No labels found</p>}>
          <div class='grid grid-cols-2 gap-4 py-1 text-gray-400 font-medium'>
            <span>Key</span>
            <span class="text-right">Value</span>
          </div>
          <For each={Object.entries(props.container()?.label ?? {})}>
            {([key, value]) => (
              <div class='grid grid-cols-2 gap-4 py-1 items-center'>
                <Copyable
                  value={key}
                  textClass='text-gray-400 break-all'
                />
                <Copyable
                  value={value as string}
                  display={truncateLabel(key, value as string)}
                  align="right"
                  textClass='text-right truncate'
                />
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}

type PortBinding = {
  HostIp: string;
  HostPort: string;
};

type PortBindings = Record<string, PortBinding[]>;

function ContainerPortForward(props: any) {
  const ports = createMemo(() => {
    const c = props.container();
    if (!c) return [];

    // Primary: mapped ports from backend
    if (Array.isArray(c.ports) && c.ports.length > 0) {
      return c.ports.map((p: any) => ({
        hostPort: p.host_port || "-",
        containerPort: p.container_port || "-",
        protocol: p.protocol || "tcp",
      }));
    }

    // Fallback: HostConfig.PortBindings or NetworkSettings.Ports
    const portBindings = (c.HostConfig?.PortBindings ?? c.NetworkSettings?.Ports ?? {}) as PortBindings;
    return Object.entries(portBindings).flatMap(
      ([containerPortWithProtocol, bindings]) => {
        const [containerPort, protocol] = containerPortWithProtocol.split("/");
        if (!bindings || bindings.length === 0) {
          return [{ hostPort: "-", containerPort, protocol }];
        }
        return bindings.map((binding) => ({
          hostPort: binding.HostPort || "-",
          containerPort,
          protocol,
        }));
      }
    );
  });

  return (
    <div class='h-fit rounded bg-[#151619] p-3 min-w-0'>
      <div class='flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <PortsIcon size={14} color="#82f969" />
        <span class='text-md font-medium'>Port Forwards</span>
      </div>
      <div class="text-gray-200 pt-2">
        <Show
          when={ports().length > 0}
          fallback={<p class="text-neutral-500 py-2 text-center">No port forwards found</p>}>
          <div class='grid grid-cols-3 gap-2 py-1 text-gray-400 font-medium'>
            <span>Host Port</span>
            <span class="text-center">ContainerPort</span>
            <span class="text-right">Protocol</span>
          </div>
          <For each={ports()}>
            {(port) => (
              <div class='grid grid-cols-3 gap-2 py-1 items-center'>
                <span class='text-blue-500'>{port.hostPort}</span>
                <span class='text-center'>{port.containerPort}</span>
                <span class='text-neutral-400 uppercase text-right'>{port.protocol}</span>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}

function ContainerMount(props: any) {
  const mounts = createMemo(() => {
    const c = props.container();
    if (!c) return [];

    if (Array.isArray(c.mounts) && c.mounts.length > 0) {
      return c.mounts.map((m: any) => ({
        source: m.source || "-",
        destination: m.destination || "-",
      }));
    }

    if (Array.isArray(c.Mounts) && c.Mounts.length > 0) {
      return c.Mounts.map((m: any) => ({
        source: m.Source || "-",
        destination: m.Destination || "-",
      }));
    }

    return [];
  });

  return (
    <div class='h-fit rounded bg-[#151619] p-3 min-w-0'>
      <div class='flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <EjectIcon size={14} color="#EB3362" />
        <span class='text-md font-medium'>Mounts</span>
      </div>
      <div class="text-gray-200 pt-2">
        <Show
          when={mounts().length > 0}
          fallback={<p class="text-neutral-500 py-2 text-center">No mounts found</p>}>
          <div class='grid grid-cols-2 gap-4 py-1 text-gray-400 font-medium'>
            <span>Source</span>
            <span class="text-right">Destination</span>
          </div>
          <For each={mounts()}>
            {(mount) => (
              <div class='grid grid-cols-2 gap-4 py-1 items-center'>
                <Copyable
                  value={mount.source}
                  textClass='text-blue-400 truncate'
                />
                <Copyable
                  value={mount.destination}
                  align="right"
                  textClass='text-right truncate text-gray-300'
                />
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
}

export default function ContainerInfo(props: any) {
  return (
    <div class="rounded-md bg-[#0A0A0B] h-full overflow-y-auto">
      <div class='p-1 grid grid-cols-1 gap-2 items-start w-full min-w-0'>
        <Loading
          fallback={
            <h1>
              About Loading...
            </h1>
          }>
          <ContainerAbout container={props.container} />
        </Loading>
        <Loading
          fallback={
            <h1>
              Port forward Loading...
            </h1>
          }>
          <ContainerPortForward container={props.container} />
        </Loading>
        <Loading
          fallback={
            <h1>
              Mount Loading...
            </h1>
          }>
          <ContainerMount container={props.container} />
        </Loading>
        <Loading
          fallback={
            <h1>Labels loading...
            </h1>
          }>
          <ContainerLabels container={props.container} />
        </Loading>
      </div>
    </div>
  );
}
