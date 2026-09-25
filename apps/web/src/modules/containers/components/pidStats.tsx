import { createMemo, } from "solid-js";
import { PortsIcon } from "../../../global/components/_icons/ports";

export function PIdStats(props: any) {

  // Show current PIds
  const currentPIDs = createMemo(() => {
    const list = props.stats;

    return list.at(-1)?.pids ?? {
      limit: 0,
      currentPId: 0
    };
  });

  return (
    <div class='h-fit rounded bg-[#151619] p-3'>
      <div class='flex items-start justify-between gap-3'>
        <div class='flex items-center justify-between gap-3'>
          <PortsIcon size={14} color='#df915e' />
          <span class="text-md font-medium">PIds</span>
        </div>
      </div>
      <div class='flex items-center justify-between pt-5 flex-wrap gap-y-2'>
        <div>
          <span class='text-neutral-500'>
            Running:
          </span>
          <h1 class='text-2xl pt-2'>
            {currentPIDs()?.currentPId}
          </h1>
        </div>
        <div>
          <span class='text-neutral-500'>
            Limit:
          </span>
          <h3 class='text-2xl pt-2'>{currentPIDs()?.limit}</h3>
        </div>
      </div>
    </div>
  );
}

