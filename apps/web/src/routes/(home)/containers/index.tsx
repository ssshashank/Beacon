import { DetailEmptyState } from "../../../global/components/_common/emptyState";
import { ContainerIcon } from "../../../global/components/_icons/container";

export default function ContainersIndexScreen() {
  return (
    <DetailEmptyState
      icon={<ContainerIcon size={48} color="#525252" />}
      message="Select a container from the sidebar to inspect"
    />
  );
}
