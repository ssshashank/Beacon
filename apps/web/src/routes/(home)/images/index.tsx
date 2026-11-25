import { DetailEmptyState } from "../../../global/components/_common/emptyState";
import { LayersIcon } from "../../../global/components/_icons/layers";

export default function ImagesIndexScreen() {
  return (
    <DetailEmptyState
      icon={<LayersIcon size={48} color="#525252" />}
      message="Select an image from the sidebar to inspect"
    />
  );
}
