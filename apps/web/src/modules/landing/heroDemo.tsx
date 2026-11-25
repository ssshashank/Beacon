import { createSignal } from 'solid-js';

interface HeroDemoProps {
  mode?: 'containers' | 'logs';
}

export function HeroDemo(props: HeroDemoProps) {
  const [selectedContainer, setSelectedContainer] = createSignal<'redis' | 'kibana'>('redis');
  const [activeTab, setActiveTab] = createSignal<'Info' | 'Stats' | 'Logs' | 'Files' | 'Processes'>('Info');
  const [sidebarFilter, setSidebarFilter] = createSignal<'running' | 'all' | 'closed'>('running');

  const containers = [
    { id: 'redis', name: 'intellifix-redis', image: 'redis:7-alpine', stack: 'intellifixbackend', port: '6379:6379', state: 'Running' },
    { id: 'app', name: 'intellifix-app', image: 'intellifixbackend-app', stack: 'intellifixbackend', port: '3000:3000', state: 'Running' },
    { id: 'kibana', name: 'intellifix-kibana', image: 'docker.elastic.co/kib...', stack: 'intellifixbackend', port: '5601:5601', state: 'Running' },
    { id: 'postgres', name: 'intellifix-postgres', image: 'postgres:16-alpine', stack: 'intellifixbackend', port: '5432:5432', state: 'Running' },
    { id: 'rabbitmq', name: 'intellifix-rabbitmq', image: 'rabbitmq:3-managem...', stack: 'intellifixbackend', port: '5672:5672', state: 'Running' },
    { id: 'qdrant', name: 'intellifix-qdrant', image: 'qdrant/qdrant', stack: 'intellifixbackend', port: '6333:6333', state: 'Running' },
    { id: 'nats', name: 'intellifix-nats', image: 'nats:2-alpine', stack: 'intellifixbackend', port: '4222:4222', state: 'Running' },
    { id: 'elasticsearch', name: 'intellifix-elasticse...', image: 'docker.elastic.co/ela...', stack: 'intellifixbackend', port: '9200:9200', state: 'Running' },
  ];

  const logLines = [
    { line: 38, stream: 'STDOUT', time: '22/11/2026 11:10:01', level: 'INFO', msg: '[2026-11-22T05:40:01.765+00:00][INFO ][plugins.taskManager] TaskManager is identified by the Kibana UUID: 61fd944d-6e82-4da3-902c-c9886708594c' },
    { line: 39, stream: 'STDOUT', time: '22/11/2026 11:10:01', level: 'INFO', msg: '[2026-11-22T05:40:01.992+00:00][INFO ][custom-branding-service] CustomBrandingService registering plugin: customBranding' },
    { line: 40, stream: 'STDOUT', time: '22/11/2026 11:10:02', level: 'WARN', msg: '[2026-11-22T05:40:02.375+00:00][WARN ][plugins.screenshotting.config] Chromium sandbox provides an additional layer of protection, but is not supported for Linux.' },
    { line: 41, stream: 'STDOUT', time: '22/11/2026 11:10:02', level: 'WARN', msg: '[2026-11-22T05:40:02.600+00:00][WARN ][plugins.security.config] Session cookies will be transmitted over insecure connections. This is not recommended.' },
    { line: 42, stream: 'STDOUT', time: '22/11/2026 11:10:02', level: 'WARN', msg: '[2026-11-22T05:40:02.614+00:00][WARN ][plugins.security.config] Session cookies will be transmitted over insecure connections. This is not recommended.' },
    { line: 43, stream: 'STDOUT', time: '22/11/2026 11:10:02', level: 'INFO', msg: '[2026-11-22T05:40:02.708+00:00][INFO ][plugins.encryptedSavedObjects] Hashed \'xpack.encryptedSavedObjects.encryptionKey\' for this instance.' },
    { line: 44, stream: 'STDOUT', time: '22/11/2026 11:10:02', level: 'INFO', msg: '[2026-11-22T05:40:02.813+00:00][INFO ][plugins.notifications] Email Service Error: Email connector not specified.' },
    { line: 45, stream: 'STDOUT', time: '22/11/2026 11:10:02', level: 'INFO', msg: '[2026-11-22T05:40:02.965+00:00][INFO ][plugins.alerting] using indexes and aliases for persisting alerts' },
    { line: 46, stream: 'STDOUT', time: '22/11/2026 11:10:04', level: 'INFO', msg: '[2026-11-22T05:40:04.267+00:00][INFO ][plugins.cloudSecurityPosture] Registered task successfully [Task: cloud_security_posture_stats_task]' },
    { line: 47, stream: 'STDOUT', time: '22/11/2026 11:10:06', level: 'INFO', msg: '[2026-11-22T05:40:06.033+00:00][INFO ][plugins.securitySolution.endpoint:user-artifact-packager:1.0.0] Registering endpoint:user-artifact-packager' },
    { line: 48, stream: 'STDOUT', time: '22/11/2026 11:10:06', level: 'INFO', msg: '[2026-11-22T05:40:06.282+00:00][INFO ][plugins.assetManager] Server is NOT enabled' },
    { line: 49, stream: 'STDOUT', time: '22/11/2026 11:10:06', level: 'ERROR', msg: '[2026-11-22T05:40:06.473+00:00][ERROR][elasticsearch-service] Unable to retrieve version information from Elasticsearch nodes. getaddrinfo ENOTFOUND' },
    { line: 50, stream: 'STDOUT', time: '22/11/2026 11:10:07', level: 'INFO', msg: '[2026-11-22T05:40:07.659+00:00][INFO ][plugins.screenshotting.chromium] Browser executable: /usr/share/kibana/node_modules/@kbn/screenshotting-plugin/chromium' },
    { line: 51, stream: 'STDOUT', time: '22/11/2026 11:11:09', level: 'ERROR', msg: '[2026-11-22T05:41:09.001+00:00][ERROR][elasticsearch-service] Unable to retrieve version information from Elasticsearch nodes. connect ECONNREFUSED' },
    { line: 52, stream: 'STDOUT', time: '22/11/2026 11:11:21', level: 'ERROR', msg: '[2026-11-22T05:41:21.514+00:00][ERROR][elasticsearch-service] Unable to retrieve version information from Elasticsearch nodes. security_exception' },
    { line: 53, stream: 'STDOUT', time: '22/11/2026 11:11:21', level: 'INFO', msg: 'Root causes: security_exception: unable to authenticate user [kibana_system] for REST request [/_nodes?filter_path=nodes.*.version]' },
    { line: 54, stream: 'STDOUT', time: '22/11/2026 11:30:03', level: 'ERROR', msg: '[2026-11-22T06:00:03.655+00:00][ERROR][plugins.ruleRegistry] Error: Timeout: it took more than 1200000ms at Timeout._onTimeout' },
  ];

  const isLogs = () => props.mode === 'logs' || activeTab() === 'Logs';

  return (
    <div class="relative w-full h-[580px] sm:h-[620px] lg:h-[680px] flex flex-col bg-[#0b0c0f] text-[#f5f5f7] font-sans select-none overflow-hidden text-xs">
      {/* Top Application Bar (Exact match to user's real dashboard) */}
      <div class="h-10 shrink-0 bg-[#0d0e12] border-b border-[#1f2026] flex items-center justify-between px-3.5">
        <div class="flex items-center gap-3">
          {/* Logo B. */}
          <div class="flex items-center gap-1.5 font-bold tracking-tight text-sm text-white">
            <span class="text-white font-extrabold text-base">B.</span>
            <span class="text-xs font-semibold text-neutral-200">Containers</span>
            <span class="text-[10px] text-neutral-500 font-mono ml-0.5">12 total</span>
          </div>

          {/* Running Pill Badge */}
          <div class="flex items-center gap-1.5 rounded-sm bg-[#16171d] border border-[#262833] px-2 py-0.5 text-[10px] text-emerald-400 font-mono">
            <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>9 running</span>
          </div>
        </div>

        {/* Selected Container Title / Breadcrumb */}
        <div class="flex items-center gap-3 min-w-0">
          <div class="hidden md:flex items-center gap-2 text-[11px] font-mono text-neutral-400 truncate">
            <span class="size-2 rounded-full bg-emerald-400 shrink-0" />
            <span class="text-white font-medium truncate">
              {isLogs() ? 'intellifix-kibana' : 'intellifix-redis'}
            </span>
            <span class="text-neutral-600">/</span>
            <span class="text-neutral-500 text-[10px] truncate max-w-[220px]">
              {isLogs() ? 'sha256:aa596f0f8eac0529b4275128699db835e...' : 'sha256:ff02b58f971e7d7d156a1267e283fcbb...'}
            </span>
            <span class="text-neutral-600 cursor-pointer hover:text-white">⧉</span>
          </div>

          {/* Sub Navigation Tabs */}
          <div class="flex items-center bg-[#13141a] rounded-sm p-0.5 border border-[#23242e]">
            {(['Info', 'Stats', 'Logs', 'Files', 'Processes'] as const).map((tab) => (
              <button
                type="button"
                onClick={() => setActiveTab(tab)}
                class={`px-2.5 py-0.5 rounded-xs text-[11px] font-medium transition cursor-pointer ${
                  (isLogs() && tab === 'Logs') || (!isLogs() && tab === 'Info')
                    ? 'bg-[#222430] text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Body: Sidebar + Detail Pane */}
      <div class="flex-1 flex overflow-hidden">
        {/* Left Tree Explorer (Exact match to user's real sidebar) */}
        <div class="w-56 sm:w-64 shrink-0 bg-[#090a0d] border-r border-[#1f2026] flex flex-col overflow-hidden">
          {/* Filter Pills */}
          <div class="p-2 border-b border-[#1f2026] flex gap-1">
            <button
              type="button"
              onClick={() => setSidebarFilter('running')}
              class={`flex-1 py-1 rounded-sm text-[10px] font-medium text-center transition cursor-pointer ${
                sidebarFilter() === 'running'
                  ? 'bg-[#181a22] text-emerald-400 border border-emerald-500/30'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Running (9)
            </button>
            <button
              type="button"
              onClick={() => setSidebarFilter('all')}
              class={`flex-1 py-1 rounded-sm text-[10px] font-medium text-center transition cursor-pointer ${
                sidebarFilter() === 'all'
                  ? 'bg-[#181a22] text-white border border-[#2e303d]'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              All (12)
            </button>
            <button
              type="button"
              onClick={() => setSidebarFilter('closed')}
              class={`flex-1 py-1 rounded-sm text-[10px] font-medium text-center transition cursor-pointer ${
                sidebarFilter() === 'closed'
                  ? 'bg-[#181a22] text-neutral-300 border border-[#2e303d]'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Closed (3)
            </button>
          </div>

          {/* Container Tree List */}
          <div class="flex-1 overflow-y-auto p-1.5 space-y-3 font-mono text-[11px]">
            {/* Stack 1: beacon */}
            <div>
              <div class="flex items-center gap-1.5 px-2 py-1 text-neutral-400 font-semibold text-[10px] uppercase tracking-wider">
                <span class="text-amber-500 text-xs">⬡</span>
                <span>beacon</span>
              </div>
              <div class="mt-0.5 px-2 py-1.5 rounded-sm hover:bg-[#14161f] cursor-pointer flex items-center justify-between text-neutral-300 group">
                <div class="flex items-center gap-2 truncate">
                  <span class="text-amber-400 text-xs">⬡</span>
                  <div class="truncate">
                    <p class="truncate text-white font-medium">beacon</p>
                    <p class="text-[9px] text-neutral-500 truncate">sha256:49d83b3ac62b...</p>
                  </div>
                </div>
                <div class="flex items-center gap-1 opacity-60 group-hover:opacity-100 text-neutral-400 text-[10px]">
                  <span>⇄</span>
                  <span>⌗</span>
                  <span>⧉</span>
                  <span class="size-1.5 rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>

            {/* Stack 2: intellifixbackend */}
            <div>
              <div class="flex items-center gap-1.5 px-2 py-1 text-neutral-400 font-semibold text-[10px] uppercase tracking-wider">
                <span class="text-amber-500 text-xs">⬡</span>
                <span>intellifixbackend</span>
              </div>
              <div class="mt-0.5 space-y-0.5">
                {containers.map((c) => {
                  const isSelected = isLogs() ? c.id === 'kibana' : c.id === selectedContainer();
                  return (
                    <div
                      onClick={() => setSelectedContainer(c.id as any)}
                      class={`px-2 py-1.5 rounded-sm cursor-pointer flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-[#181a24] border border-[#2b2e3d] text-white shadow-sm'
                          : 'hover:bg-[#12131a] text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <div class="flex items-center gap-2 truncate">
                        <span class={`text-xs ${isSelected ? 'text-blue-400' : 'text-emerald-400'}`}>⬡</span>
                        <div class="truncate">
                          <p class={`truncate text-xs ${isSelected ? 'text-white font-medium' : 'text-neutral-300'}`}>
                            {c.name}
                          </p>
                          <p class="text-[9px] text-neutral-500 truncate">{c.image}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-1 shrink-0 text-[10px] text-neutral-400">
                        <span>⇄</span>
                        <span>⌗</span>
                        <span class="size-1.5 rounded-full bg-emerald-400 ml-0.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Detail Pane */}
        <div class="flex-1 bg-[#0b0c10] overflow-y-auto">
          {isLogs() ? (
            /* Logs Mode (Exact match to Image 2 kibana logs) */
            <div class="h-full flex flex-col font-mono text-[11px] leading-relaxed relative bg-[#090a0d]">
              <div class="flex-1 overflow-y-auto divide-y divide-[#181922] p-2 space-y-1">
                {logLines.map((log) => (
                  <div class="flex items-start gap-2.5 py-1 px-2 hover:bg-[#12131c] rounded-xs transition">
                    <span class="text-neutral-600 select-none text-[10px] w-6 text-right shrink-0">
                      {log.line}.
                    </span>
                    <span class="px-1.5 py-0.2 rounded-xs text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
                      {log.stream}
                    </span>
                    <span class="text-neutral-500 text-[10px] shrink-0">{log.time}</span>
                    <span
                      class={`break-all ${
                        log.level === 'ERROR'
                          ? 'text-red-400 font-medium'
                          : log.level === 'WARN'
                          ? 'text-amber-300'
                          : 'text-neutral-300'
                      }`}
                    >
                      {log.msg}
                    </span>
                  </div>
                ))}
              </div>

              {/* Jump to latest button */}
              <div class="sticky bottom-3 right-3 self-end pr-4 pointer-events-auto">
                <button
                  type="button"
                  class="rounded-sm border border-[#2b2e3d] bg-[#14151e]/90 px-2.5 py-1 text-[10px] text-neutral-300 hover:text-white shadow-lg backdrop-blur cursor-pointer flex items-center gap-1"
                >
                  <span>↓ Jump to latest</span>
                </button>
              </div>
            </div>
          ) : (
            /* Containers Info Mode (Exact match to Image 1 about/ports/mounts/labels) */
            <div class="p-4 sm:p-5 space-y-5 text-neutral-300 text-xs">
              {/* Section 1: About */}
              <div class="border border-[#1f2026] rounded-sm bg-[#0e0f14] overflow-hidden">
                <div class="px-3.5 py-2 bg-[#12131a] border-b border-[#1f2026] font-semibold text-white flex items-center gap-1.5 text-xs">
                  <span class="text-blue-400">ⓘ</span>
                  <span>About</span>
                </div>
                <div class="p-3.5 space-y-2 text-[11px] font-mono divide-y divide-[#171822]">
                  <div class="flex justify-between items-center py-1">
                    <span class="text-neutral-500">Name:</span>
                    <span class="text-white font-medium">/intellifix-redis</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-neutral-500">ID:</span>
                    <span class="text-neutral-300">...01164c6c8a00aff7814</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-neutral-500">Image:</span>
                    <span class="text-neutral-400 truncate max-w-[340px]">sha256:ff02b58f971e7d7d156a1267e283fcbbeee91773b6aa36c49dac28ecfe28eadf</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-neutral-500">Command:</span>
                    <span class="text-neutral-300">docker-entrypoint.sh</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-neutral-500">State:</span>
                    <span class="text-emerald-400 font-semibold flex items-center gap-1">
                      <span class="size-1.5 rounded-full bg-emerald-400" /> Running
                    </span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-neutral-500">Started At:</span>
                    <span class="text-neutral-400">22 Nov 2026, 1:13 pm</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Port Forwards */}
              <div class="border border-[#1f2026] rounded-sm bg-[#0e0f14] overflow-hidden">
                <div class="px-3.5 py-2 bg-[#12131a] border-b border-[#1f2026] font-semibold text-white flex items-center gap-1.5 text-xs">
                  <span class="text-emerald-400">⇄</span>
                  <span>Port Forwards</span>
                </div>
                <div class="p-3 text-[11px] font-mono">
                  <div class="grid grid-cols-3 text-neutral-500 pb-2 border-b border-[#1f2026] text-[10px] uppercase font-bold">
                    <span>Host Port</span>
                    <span>ContainerPort</span>
                    <span>Protocol</span>
                  </div>
                  <div class="grid grid-cols-3 py-1.5 text-blue-400">
                    <span>6379</span>
                    <span>6379</span>
                    <span class="text-neutral-300">TCP</span>
                  </div>
                  <div class="grid grid-cols-3 py-1.5 text-blue-400">
                    <span>6379</span>
                    <span>6379</span>
                    <span class="text-neutral-300">TCP</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Mounts */}
              <div class="border border-[#1f2026] rounded-sm bg-[#0e0f14] overflow-hidden">
                <div class="px-3.5 py-2 bg-[#12131a] border-b border-[#1f2026] font-semibold text-white flex items-center gap-1.5 text-xs">
                  <span class="text-amber-400">⏏</span>
                  <span>Mounts</span>
                </div>
                <div class="p-3 text-[11px] font-mono">
                  <div class="grid grid-cols-2 text-neutral-500 pb-2 border-b border-[#1f2026] text-[10px] uppercase font-bold">
                    <span>Source</span>
                    <span>Destination</span>
                  </div>
                  <div class="grid grid-cols-2 py-2">
                    <span class="text-sky-300 truncate pr-2">/var/lib/docker/volumes/intellifixbackend_redis_data/_data</span>
                    <span class="text-neutral-300">/data</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Labels */}
              <div class="border border-[#1f2026] rounded-sm bg-[#0e0f14] overflow-hidden">
                <div class="px-3.5 py-2 bg-[#12131a] border-b border-[#1f2026] font-semibold text-white flex items-center gap-1.5 text-xs">
                  <span class="text-neutral-400">◇</span>
                  <span>Labels</span>
                </div>
                <div class="p-3 text-[11px] font-mono space-y-1.5">
                  <div class="flex justify-between py-1 border-b border-[#171822]">
                    <span class="text-neutral-500">com.docker.compose.replace</span>
                    <span class="text-white">intellifix-redis</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-[#171822]">
                    <span class="text-neutral-500">com.docker.compose.service</span>
                    <span class="text-white">redis</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-[#171822]">
                    <span class="text-neutral-500">com.docker.compose.container-number</span>
                    <span class="text-white">1</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-[#171822]">
                    <span class="text-neutral-500">com.docker.compose.project</span>
                    <span class="text-white">intellifixbackend</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeroDemo;
