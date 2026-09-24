export const ContainerStatus = {
  CREATED: 'created',
  RUNNING: 'running',
  PAUSED: 'paused',
  RESTARTING: 'restarting',
  REMOVING: 'removing',
  EXITED: 'exited',
  DEAD: 'dead'
} as const;

export const ContainerKind = {
  SERVICE: 'service',
  COMPOSE_SERVICE: 'compose_service',
  JOB: 'job',
  PRIVILEDGED: 'privileged'
} as const;

export const ComposeStatus ={
  RUNNING: 'running',
  PARTIALLY_RUNNING: 'partially_running',
  EXITED: 'exited',
  PAUSED: 'paused'
};

export const BAR_WIDTH = 3;
export const GAP = 5;
