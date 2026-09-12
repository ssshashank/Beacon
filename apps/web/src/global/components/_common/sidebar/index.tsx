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
    <aside class="w-[400px] h-[calc(100vh-20px)] max-h-[calc(100vh-20px)] overflow-y-auto">
      <div class="flex items-start h-full justify-start gap-3">
        <div class="w-[50px] h-full">
          <header>
            <Tooltip as="span" title="Beacon">
              <img src={beaconLogo} class="w-12 h-12 flex items-center justify-center" />
            </Tooltip>
          </header>
          <div class="mt-5 w-full">
            <ul>
              <For each={_navItems}>
                {(item) => {
                  return (
                    <Tooltip
                      onClick={() => navigate(item.navigateTo!)}
                      title={item?.label}
                      as="li"
                      class={`flex h-12 flex-col items-center justify-center group transition-opacity cursor-pointer duration-150 p-2
                      ${isActiveRoutes(item.navigateTo!) ? 'bg-[#151619] rounded-md opacity-100' : 'opacity-40 hover:opacity-70'}`}>
                      {item?.icon}
                    </Tooltip>
                  );
                }}
              </For>
            </ul>
          </div>
          <footer>
          </footer>
        </div>
        <Show when={activeItem()?.component}>
          <Dynamic component={activeItem()!.component} label={activeItem()?.label ?? ""} />
        </Show>
      </div>
    </aside>
  );
}
