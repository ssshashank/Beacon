import { DetailEmptyState } from "../../../global/components/_common/emptyState";
import { NetworkIcons } from "../../../global/components/_icons/network";

export default function NetworksIndexScreen() {
  return (
    <DetailEmptyState
      icon={<NetworkIcons size={48} color="#525252" />}
      message="Select a network from the sidebar to inspect"
    />
  );
}
