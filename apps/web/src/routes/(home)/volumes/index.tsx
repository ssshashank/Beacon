import { DetailEmptyState } from "../../../global/components/_common/emptyState";
import { VolumeIcon } from "../../../global/components/_icons/volume";

export default function VolumesIndexScreen() {
  return (
    <DetailEmptyState
      icon={<VolumeIcon size={48} color="#525252" />}
      message="Select a volume from the sidebar to inspect"
    />
  );
}
