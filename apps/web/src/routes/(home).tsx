import { RouteSectionProps, useLocation } from "@solidjs/router";
import { Sidebar } from "../global/components/_common/sidebar";
import ContainersSidebarPanel from "../modules/containers/components/containersPanel";
import { isSidebarRouteActive } from "../global/utils/route";
import ImagesSidebarPanel from "../modules/images/components/imagesPanel";
import VolumesSidebarPanel from "../modules/volumes/components/volumesPanel";
import NetworksSidebarPanel from "../modules/networks/components/networksPanel";
import { VolumeIcon } from "../global/components/_icons/volume";
import { ContainerIcon } from "../global/components/_icons/container";
import { LayersIcon } from "../global/components/_icons/layers";
import { NetworkIcons } from "../global/components/_icons/network";

const _navItems = [
  {
    id: 'containers',
    label: 'Containers',
    icon: <ContainerIcon size={20} />,
    component: ContainersSidebarPanel,
    navigateTo: '/containers',
  }, {
    id: 'images',
    label: 'Images',
    icon: <LayersIcon size={20} />,
    component: ImagesSidebarPanel,
    navigateTo: '/images',
  }, {
    id: 'volumes',
    label: 'Volumes',
    icon: <VolumeIcon size={20} />,
    component: VolumesSidebarPanel,
    navigateTo: '/volumes',
  }, {
    id: 'networks',
    label: 'Networks',
    icon: <NetworkIcons size={20} />,
    component: NetworksSidebarPanel,
    navigateTo: '/networks',
  }
];

export default function HomeLayout(props: RouteSectionProps) {
  const location = useLocation();
  const isActiveRoutes = (path: string) => isSidebarRouteActive(location.pathname, path);

  return (
    <div class="w-screen h-screen mx-auto">
      <div class="w-full h-screen mx-auto p-2.5">
        <div class="flex items-start justify-start w-[calc(100vw-20px)] h-[calc(100vh-20px)]">
          <Sidebar _navItems={_navItems} isActiveRoutes={isActiveRoutes} />
          <div class="rounded-md w-full md:w-[calc(100vw-420px)] h-[calc(100vh-20px)] bg-[#151619] overflow-y-auto">
            {props?.children}
          </div>
        </div>
      </div>
    </div>
  );
}
