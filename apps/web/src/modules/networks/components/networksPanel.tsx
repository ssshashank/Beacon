import { createEffect, createMemo, createSignal, For, Loading, Show } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { listNetworksQuery } from "../queries";
import NetworksAPI from "../api";
import EventStream from "../../events/stream";
import { createBGColorGenerator } from "../../../global/reactivity/createBgColor";
import { NetworkIcons } from "../../../global/components/_icons/network";
import { TrashIcon } from "../../../global/components/_icons/trash";
import { StatusDot } from "../../../global/components/_common/statusDot";
import { ContainerStatus } from "../../containers/constant";
import type { NetworkDTO } from "../types";
import { formatTimeAgoString } from "../mapper";
import allContainersSvg from "~/assets/_svgs/allContainers.svg";
import { isSidebarRouteActive } from "../../../global/utils/route";
import { listContainersQuery } from "../../containers/queries";
import {
  SidebarPanelHeader,
  SidebarEmptyState,
  SidebarListItem,
  SidebarActionButton,
} from "../../../global/components/_common/sidebarPanel";

function NetworkList(props: {
  networks: NetworkDTO[];
  emptyIcon: string;
  emptyMessage: string;
  loadingNetworkIds: Record<string, boolean>;
  onDelete: (e: MouseEvent, id: string, name: string) => void;
  isInUse: (net: NetworkDTO) => boolean;
}) {
  const location = useLocation();
  const isActiveRoute = (path: string) => {
    const current = decodeURIComponent(location.pathname);
    const target = decodeURIComponent(path);
    return isSidebarRouteActive(current, target);
  };
  const navigate = useNavigate();

  return (
    <Show
      when={props.networks.length > 0}
      fallback={<SidebarEmptyState icon={props.emptyIcon} message={props.emptyMessage} />}>
      <ul class="mt-2">
        <For each={props.networks}>
          {(net, index) => {
            const [hexColor] = createBGColorGenerator(net.name);
            const inUse = createMemo(() => props.isInUse(net));
            const isActive = createMemo(() => isActiveRoute(`/networks/${encodeURIComponent(net.id)}`));
            const isLoading = createMemo(() => Boolean(props.loadingNetworkIds[net.id]));
            const subtitleText = createMemo(() => {
              const driver = net.driver || "bridge";
              const time = formatTimeAgoString(net.created);
              return `${driver} · ${time}`;
            });

            return (
              <SidebarListItem
                isActive={isActive()}
                onClick={() =>
                  navigate(`/networks/${encodeURIComponent(net.id)}`, {
                    state: { network: net, color: hexColor(), status: inUse() },
                  })
                }
                isLast={index() === props.networks.length - 1}
                color={hexColor()}
                dimmed={!inUse()}
                icon={<NetworkIcons size={24} color={hexColor()} />}
                title={net.name}
                subtitle={subtitleText()}
                actions={
                  <>
                    <SidebarActionButton
                      title="Delete network"
                      variant="danger"
                      loading={isLoading()}
                      onClick={(e) => props.onDelete(e, net.id, net.name)}>
                      <TrashIcon size={13} />
                    </SidebarActionButton>

                    <Show when={inUse()}>
                      <span class="ml-1 flex items-center">
                        <StatusDot status={ContainerStatus.RUNNING} size={8} />
                      </span>
                    </Show>
                  </>
                }
              />
            );
          }}
        </For>
      </ul>
    </Show>
  );
}

export default function NetworksSidebarPanel(props: any) {
  const rawNetworks = createMemo(() => listNetworksQuery() ?? []);
  const rawContainers = createMemo(() => listContainersQuery() ?? []);
  const [deletedIds, setDeletedIds] = createSignal<Record<string, boolean>>({});
  const [loadingNetworkIds, setLoadingNetworkIds] = createSignal<Record<string, boolean>>({});

  // Real-time synchronization via Docker SSE Events
  createEffect(
    () => true,
    () => {
      let isDisposed = false;
      const es = EventStream.streamDockerEvents();

      es.onmessage = (event) => {
        if (isDisposed || !event?.data) return;
        try {
          const data = JSON.parse(event.data);
          const type = (data.Type || data.type || "").toLowerCase();
          if (type && type !== "network") return;

          const action = (data.Action || data.status || "").toLowerCase();
          const networkId = data.Actor?.ID || data.id || "";
          if (!networkId) return;

          setLoadingNetworkIds((prev) => ({ ...prev, [networkId]: false }));

          if (action === "destroy" || action === "delete") {
            setDeletedIds((prev) => ({ ...prev, [networkId]: true }));
          }
        } catch (err) {
          console.error("Error processing docker network event:", err);
        }
      };

      es.onerror = () => {
        es.close();
      };

      return () => {
        isDisposed = true;
        es.onmessage = null;
        es.onerror = null;
        es.close();
      };
    }
  );

  // Set of network names and IDs referenced by containers
  const usedNetworkNames = createMemo(() => {
    const set = new Set<string>();
    for (const group of rawContainers()) {
      for (const c of group.containers ?? []) {
        for (const netName of (c as any).networks ?? (c as any).Networks ?? []) {
          if (netName) set.add(netName);
        }
        const ns = (c as any).NetworkSettings?.Networks;
        if (ns && typeof ns === "object") {
          for (const netName of Object.keys(ns)) {
            set.add(netName);
          }
        }
      }
    }
    return set;
  });

  const isNetworkInUse = (net: NetworkDTO) => {
    const count = net.containers_count ?? Object.keys(net.containers ?? {}).length;
    if (count > 0) return true;
    const set = usedNetworkNames();
    if (set.has(net.name) || set.has(net.id)) return true;
    return false;
  };

  const networks = createMemo<NetworkDTO[]>(() => {
    const raw = rawNetworks();
    if (!Array.isArray(raw)) return [];
    const deleted = deletedIds();
    return raw.filter((net) => !deleted[net.id]);
  });

  const inUsedNetworks = createMemo(() => networks().filter((n) => isNetworkInUse(n)));

  const handleDelete = async (e: MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    const confirmed = confirm(`Are you sure you want to delete network "${name}"?`);
    if (confirmed) {
      setLoadingNetworkIds((prev) => ({ ...prev, [id]: true }));
      try {
        await NetworksAPI.deleteNetworkByID(id);
        setDeletedIds((prev) => ({ ...prev, [id]: true }));
      } catch (err) {
        console.error("Failed to delete network:", err);
        alert(`Failed to delete network "${name}". Predefined networks or networks in use cannot be deleted.`);
      } finally {
        setLoadingNetworkIds((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  return (
    <div class="flex-1 h-full p-2">
      <div class="h-full">
        <SidebarPanelHeader
          title={props.label ?? "Networks"}
          badge={networks().length > 0 ? `${inUsedNetworks().length} in use` : undefined}
        />
        <Loading>
          <NetworkList
            networks={networks()}
            emptyIcon={allContainersSvg}
            emptyMessage="No networks found"
            loadingNetworkIds={loadingNetworkIds()}
            onDelete={handleDelete}
            isInUse={isNetworkInUse}
          />
        </Loading>
      </div>
    </div>
  );
}
