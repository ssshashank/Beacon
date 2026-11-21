import { createMemo, For, Loading, Show } from "solid-js";
import { InfoIcons } from "../../../global/components/_icons/info";
import { StatusLabel } from "../../../global/components/_common/statusDot";
import { TagsIcon } from "../../../global/components/_icons/tag";
import { truncateLabel } from "../mapper";
import { PortsIcon } from "../../../global/components/_icons/ports";
import { EjectIcon } from "../../../global/components/_icons/eject";

function ContainerAbout(props: any) {

  return (
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <InfoIcons size={14} color="#3277f8" />
        <span class='text-md font-medium'>About</span>
      </div>
      <div class="text-gray-200 pt-2">
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            Name:
          </span>
          <span>
            {props.container()?.name}
          </span>
        </div>
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            ID:
          </span>
          <span class="truncate [direction:rtl] text-left max-w-[100px]">
            &lrm;{props.container()?.id}
          </span>
        </div>
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            Image:
          </span>
          <span>
            {truncateLabel("image", props.container()?.image?.name as string)}
          </span>
        </div>
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            Command:
          </span>
          <span class="truncate max-w-[150px]">
            {props.container()?.command}
          </span>
        </div>
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
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <TagsIcon size={14} color="#f8ac29" />
        <span class='text-md font-medium'>Labels</span>
      </div>
      <div class="text-gray-200 pt-2">
        <For each={Object.entries(props.container()?.label ?? {})}>
          {([key, value]) => (
            <div class='flex items-start justify-between py-1 gap-2'>
              <span class='text-gray-400 w-[50%]'>{truncateLabel(key, key as string)}</span>
              <span class='w-[50%]' >{truncateLabel(key, value as string)}</span>
            </div>
          )}
        </For>
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
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <PortsIcon size={14} color="#82f969" />
        <span class='text-md font-medium'>Port Forwards</span>
      </div>
      <div class="text-gray-200 pt-2">
        <Show
          when={ports().length > 0}
          fallback={<p class="text-xs text-neutral-500 py-2 text-center">No port forwards found</p>}
        >
          <div class='flex items-center justify-between py-1 text-gray-400 text-xs font-medium'>
            <span>Host Port</span>
            <span>ContainerPort</span>
            <span>Protocol</span>
          </div>
          <For each={ports()}>
            {(port) => (
              <div class='flex items-center justify-between py-1 text-xs'>
                <span class='text-blue-500 font-mono'>{port.hostPort}</span>
                <span class='font-mono'>{port.containerPort}</span>
                <span class='text-neutral-400 uppercase text-[11px]'>{port.protocol}</span>
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
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <EjectIcon size={14} color="#EB3362" />
        <span class='text-md font-medium'>Mounts</span>
      </div>
      <div class="text-gray-200 pt-2">
        <Show
          when={mounts().length > 0}
          fallback={<p class="text-xs text-neutral-500 py-2 text-center">No mounts found</p>}
        >
          <div class='flex items-center justify-between py-1 text-gray-400 text-xs font-medium'>
            <span>Sources</span>
            <span>Destination</span>
          </div>
          <For each={mounts()}>
            {(mount) => (
              <div class='flex items-center justify-between py-1 text-xs gap-4'>
                <span class='text-blue-400 font-mono truncate max-w-[50%]' title={mount.source}>
                  {mount.source}
                </span>
                <span class='font-mono truncate max-w-[50%]' title={mount.destination}>
                  {mount.destination}
                </span>
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
      <div class='p-1 grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 gap-y-2 items-start'>
        <div class='grid gap-y-2'>
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
        </div>
        <div>
          <Loading
            fallback={
              <h1>Labels loading...
              </h1>
            }>
            <ContainerLabels container={props.container} />
          </Loading>
        </div>
      </div>
    </div>
  );
}
