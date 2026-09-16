import { Show } from "solid-js";
import { ContainerStatus } from "../../../../modules/containers/constant";
import { ContainerStatusType } from "../../../../modules/containers/types";

type Tone = "success" | "pending" | "warning" | "info" | "danger" | "halted";
const STATUS_CONFIG: Record<ContainerStatusType, { label: string; tone: Tone; pulse: boolean }> = {
  [ContainerStatus.RUNNING]: { label: "Running", tone: "success", pulse: true },
  [ContainerStatus.CREATED]: { label: "Created", tone: "pending", pulse: false },
  [ContainerStatus.PAUSED]: { label: "Paused", tone: "warning", pulse: false },
  [ContainerStatus.RESTARTING]: { label: "Restarting", tone: "info", pulse: true },
  [ContainerStatus.REMOVING]: { label: "Removing", tone: "danger", pulse: true },
  [ContainerStatus.EXITED]: { label: "Exited", tone: "halted", pulse: false },
  [ContainerStatus.DEAD]: { label: "Dead", tone: "danger", pulse: false },
};

function toneVars(tone: string) {
  return {
    bg: `var(--color-${tone}-subtle-bg)`,
    text: `var(--color-${tone}-subtle-text)`,
    border: `var(--color-${tone}-subtle-border)`,
    dot: `var(--color-${tone}-500)`,
  };
}

interface StatusDotProps {
  status: ContainerStatusType;
  size?: number;
}

export function StatusDot(props: StatusDotProps) {
  const config = () => STATUS_CONFIG[props.status] ?? STATUS_CONFIG[ContainerStatus.EXITED];
  const vars = () => toneVars(config().tone);
  const size = () => props.size ?? 8;

  return (
    <span class="relative inline-flex" style={{ width: `${size()}px`, height: `${size()}px` }}>
      <Show when={config().pulse}>
        <span
          class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ "background-color": vars().dot }}
        />
      </Show>
      <span
        class="relative inline-flex h-full w-full rounded-full"
        style={{ "background-color": vars().dot }}
      />
    </span>
  );
}

interface StatusLabelProps {
  status: ContainerStatusType
}

export function StatusLabel(props: StatusLabelProps) {
  const config = () => STATUS_CONFIG[props.status] ?? STATUS_CONFIG[ContainerStatus.EXITED];
  const vars = () => toneVars(config().tone);

  return (
    <span style={{ "color": vars().dot }}>
      {config()?.label}
    </span>
  );
}
