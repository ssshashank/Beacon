import { RouteSectionProps, useLocation } from "@solidjs/router";
import { Sidebar } from "../global/components/_common/sidebar";
import ContainersSidebarPanel from "../modules/containers/components/containersPanel";

const _navItems = [
  {
    id: 'containers',
    label: 'Containers',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-container"><path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z" /><path d="M10 21.9V14L2.1 9.1" /><path d="m10 14 11.9-6.9" /><path d="M14 19.8v-8.1" /><path d="M18 17.5V9.4" /></svg>,
    component: ContainersSidebarPanel,
    navigateTo: '/containers',
  }, {
    id: 'images',
    label: 'Images',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gallery-vertical-end"><path d="M7 2h10" /><path d="M5 6h14" /><rect width="18" height="12" x="3" y="10" rx="2" /></svg>,
    component: null,
    navigateTo: '/images',
  }
];

export default function HomeLayout(props: RouteSectionProps) {
  const location = useLocation();
  const isActiveRoutes = (path: string) => location.pathname === path;

  return (
    <div class="w-screen h-screen mx-auto">
      <div class="w-full h-screen mx-auto p-2.5">
        <div class="flex items-start justify-start w-[calc(100vw-20px)] h-[calc(100vh-20px)]">
          <Sidebar _navItems={_navItems} isActiveRoutes={isActiveRoutes}/>
          <div class="rounded-md w-[calc(100vw-420px)] h-[calc(100vh-20px)] bg-[#151619] overflow-y-auto">
            {props?.children}
          </div>
        </div>
      </div>
    </div>
  );
}
