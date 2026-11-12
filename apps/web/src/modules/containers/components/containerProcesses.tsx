import { createMemo, For, Loading, Show } from "solid-js";
import { getAllProcessRunningInContainerQuery } from "../queries";
import { CPUIcons } from "../../../global/components/_icons/cpu";

export default function ContainerProcesses(props: any) {
  const { params } = props;
  const processes = createMemo(() => getAllProcessRunningInContainerQuery(params?.id!) ?? []);

  return (
    <div class="rounded-md bg-[#0A0A0B] h-full overflow-y-auto">

      <div class='p-1 grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2 gap-y-2 items-start'>
        <div class="h-fit rounded bg-[#151619] p-3">
          <div class='flex items-center justify-start gap-3 border-b-[0.03px] pb-3 border-neutral-700'>
            <CPUIcons size={14} color="#3277f8" />
            <span class='text-md font-medium'>Processes</span>
          </div>
          <Loading
            fallback={
              <p class="text-sm text-gray-500 py-4 text-center">Loading processes...</p>
            }>
            <Show
              when={processes().length > 0}
              fallback={
                <p class="text-sm text-gray-500 py-4 text-center">No processes found</p>
              }>
              <div class="overflow-x-auto pt-2">
                <table class="w-full text-sm text-gray-200 whitespace-nowrap">
                  <thead>
                    <tr class="text-mist-400 text-left border-b-[0.03px] border-neutral-700">
                      <th class="py-2 pr-4 font-normal">User</th>
                      <th class="py-2 pr-4 font-normal">Pid</th>
                      <th class="py-2 pr-4 font-normal">Ppid</th>
                      <th class="py-2 pr-4 font-normal">%CPU</th>
                      <th class="py-2 pr-4 font-normal">Start</th>
                      <th class="py-2 pr-4 font-normal">Tty</th>
                      <th class="py-2 pr-4 font-normal">Time</th>
                      <th class="py-2 font-normal">Command</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={processes()}>
                      {(process) => (
                        <tr class="border-b-[0.03px] border-neutral-800">
                          <td class="py-2 pr-4">{process.user_type}</td>
                          <td class="py-2 pr-4">{process.pid}</td>
                          <td class="py-2 pr-4">{process.ppid}</td>
                          <td class="py-2 pr-4 text-blue-500">{process.cpu_utilization}</td>
                          <td class="py-2 pr-4">{process.start_time}</td>
                          <td class="py-2 pr-4">{process.teletypewriter}</td>
                          <td class="py-2 pr-4">{process.cummulative_cpu_time}</td>
                          <td class="py-2 truncate max-w-[320px]">{process.cmd}</td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </Loading>
        </div>
      </div>
    </div>
  );
}
