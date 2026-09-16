import { createMemo, For, Loading } from "solid-js";
import { InfoIcons } from "../../../global/components/_icons/info";
import { StatusLabel } from "../../../global/components/_common/statusDot";
import { TagsIcon } from "../../../global/components/_icons/tag";
import { truncateLabel } from "../mapper";
import { PortsIcon } from "../../../global/components/_icons/ports";
import { EjectIcon } from "../../../global/components/_icons/eject";

function ContainerAbout(props: any) {
  const networkDetail: any = () => Object.values(props.container().NetworkSettings.Networks ?? {})[0];

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
            {props.container().Name}
          </span>
        </div>
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            ID:
          </span>
          <span class="truncate [direction:rtl] text-left max-w-[100px]">
            &lrm;{props.container().Id}
          </span>
        </div>
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            Image:
          </span>
          <span>
            {props.container().Config?.Image}
          </span>
        </div>
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            Platform:
          </span>
          <span>
            {props.container().Platform}
          </span>
        </div>
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            Domain:
          </span>
          <span>
            {networkDetail()?.DNSNames?.[0]!}
          </span>
        </div>
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            IP Address:
          </span>
          <span class='text-blue-500'>
            {networkDetail()?.IPAddress ?? "-"}
          </span>
        </div>
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            State:
          </span>
          <StatusLabel status={props.container()?.State?.Status} />
        </div>
        <div class='flex items-center justify-between py-1'>
          <span class='text-gray-400'>
            Started At:
          </span>
          <span>
            {new Date(props.container()?.State?.StartedAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
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
        <For each={Object.entries(props.container().Config?.Labels ?? {})}>
          {([key, value]) => (
            <div class='flex items-center justify-between py-1'>
              <span class='text-gray-400'>{key}</span>
              <span>{truncateLabel(key, value as string)}</span>
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
    const portBindings = (props.container().HostConfig?.PortBindings ?? {}) as PortBindings;

    const pb = Object.entries(portBindings).flatMap(
      ([containerPortWithProtocol, bindings]) => {
        const [containerPort, protocol] =
          containerPortWithProtocol.split("/");

        return bindings.map((binding) => ({
          hostPort: binding.HostPort,
          containerPort,
          protocol,
        }));
      }
    );

    return pb;
  });

  return (
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <PortsIcon size={14} color="#82f969" />
        <span class='text-md font-medium'>Port Forwards</span>
      </div>
      <div class="text-gray-200 pt-2">
        <div class='flex items-center justify-between py-1 text-gray-400'>
          <span>Host Port</span>
          <span>ContainerPort</span>
          <span>Protocol</span>
        </div>
        <For each={ports()}>
          {(port) => (
            <div class='flex items-center justify-between py-1'>
              <span class='text-blue-500'>{port.hostPort}</span>
              <span>{port.containerPort}</span>
              <span>{port.protocol}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

function ContainerMount(props: any) {

  return (
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
        <EjectIcon size={14} color="#EB3362" />
        <span class='text-md font-medium'>Mounts</span>
      </div>
      <div class="text-gray-200 pt-2">
        <div class='flex items-center justify-between py-1 text-gray-400'>
          <span>Sources</span>
          <span>Destination</span>
        </div>
        <For each={props.container().Mounts}>
          {(mount) => (
            <div class='flex items-center justify-between py-1'>
              <span class='text-blue-400'>{mount.Source}</span>
              <span>{mount.Destination}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default function ContainerInfo(props: any) {
  return (
    <div class="rounded-md bg-[#0A0A0B] h-full overflow-y-auto">
      <div class='p-1 grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 gap-y-2'>
        <div class='grid gap-y-2'>
          <Loading fallback={<h1>About Loading...</h1>}>
            <ContainerAbout container={props.container} />
          </Loading>
          <Loading fallback={<h1>Port forward Loading...</h1>}>
            <ContainerPortForward container={props.container} />
          </Loading>
          <Loading fallback={<h1>Mount Loading...</h1>}>
            <ContainerMount container={props.container} />
          </Loading>
        </div>
        <Loading fallback={<h1>Labels loading...</h1>}>
          <ContainerLabels container={props.container} />
        </Loading>
      </div>
    </div>
  );
}
