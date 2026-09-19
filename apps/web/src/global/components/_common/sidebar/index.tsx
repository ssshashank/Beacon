import { useNavigate } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Dynamic } from "@solidjs/web";
import beaconLogo from "~/assets/_svgs/icon.svg";
import Tooltip from "../tooltip";

export function Sidebar(props: any) {
  const { _navItems, isActiveRoutes } = props;
  const navigate = useNavigate();
  const activeItem = () => _navItems.find((item: any) => isActiveRoutes(item.navigateTo));

  return (
    <>
      <aside class="w-0 md:w-[400px] h-[calc(100vh-30px)] flex flex-col md:flex-row md:h-[calc(100vh-20px)]">
        <div class="fixed bottom-10 rounded-md left-0 w-fit mx-auto right-0 z-50 h-fit flex flex-row items-center bg-gray-800/30 justify-center p-1 backdrop-blur-lg
          md:relative md:top-0 md:bottom-0 md:bg-transparent md:w-[60px] md:flex-col md:justify-start md:h-full md:border-r-[0.03px] md:border-neutral-800 md:rounded-none md:px-0">
          <header class="hidden md:flex mb-5">
            <Tooltip as="span" title="Beacon">
              <img src={beaconLogo} class="w-10 h-10 object-contain" />
            </Tooltip>
          </header>
          <div class="w-full items-center flex flex-col">
            <ul class="flex flex-row md:flex-col md:justify-start gap-1">
              <For each={_navItems}>
                {(item) => (
                  <Tooltip
                    onClick={() => navigate(item.navigateTo!)}
                    title={item?.label}
                    as="li"
                    class={`flex h-11 w-11 items-center justify-center rounded transition-all cursor-pointer ${isActiveRoutes(item.navigateTo!)
                      ? 'md:bg-[#3B3B3B80] bg-gray-500 opacity-100 text-white'
                      : 'opacity-50 hover:opacity-80 text-gray-400'
                      }`}>
                    {item?.icon}
                  </Tooltip>
                )}
              </For>
            </ul>
          </div>
        </div>
        <div class="flex-1 h-full overflow-y-auto pb-16 md:pb-0">
          <Dynamic component={activeItem()!.component} label={activeItem()?.label ?? ""} />
        </div>
      </aside>
    </>
  );
}
