import { createSignal } from 'solid-js';
import { ATMOSPHERIC_GRADIENTS, NOISE_SVG, SIGNAL_DOT_PATTERNS } from './patterns';

export default function FeatureFocus() {
  const [activeTab, setActiveTab] = createSignal(0);

  const accordions = [
    {
      title: 'Direct Unix socket transport',
      desc: 'Beacon communicates directly over /var/run/docker.sock via microsecond tokio async I/O. No TCP network overhead, no exposed internet ports, and zero security footprint.',
    },
    {
      title: 'Zero-database stateless telemetry',
      desc: 'No PostgreSQL, no SQLite, no Redis state. Every request and event stream is evaluated in-flight directly against the Docker Engine daemon.',
    },
    {
      title: 'Single-container architecture',
      desc: 'Compiled Rust backend bundles the SolidJS reactive dashboard into one single binary and image. Deploy with a single docker run or docker compose command.',
    },
  ];

  return (
    <section class="py-20 md:py-28 bg-[#08090c] text-[#f5f5f7]">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column */}
          <div class="lg:col-span-6">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
              Focus on metrics that drive uptime
            </h2>
            <p class="mt-5 text-sm sm:text-base leading-relaxed text-[#a1a1aa] max-w-md">
              Track, analyze, and inspect your Docker containers—focus on zero-lag logs, measure CPU & memory impact with real-time SSE, and uncover bottlenecks effortlessly.
            </p>

            {/* Accordion / Checklist with smooth animation */}
            <div class="mt-10 space-y-3">
              {accordions.map((item, idx) => {
                const isOpen = () => activeTab() === idx;
                return (
                  <div class="rounded-sm bg-[#12141a] p-4 sm:p-5 transition hover:bg-[#161822]">
                    <button
                      type="button"
                      onClick={() => setActiveTab(isOpen() ? -1 : idx)}
                      class="flex w-full items-center justify-between text-left text-sm sm:text-base font-medium text-white transition cursor-pointer"
                    >
                      <span>{item.title}</span>
                      <span class={`ml-4 flex size-6 shrink-0 items-center justify-center rounded-sm bg-white/10 text-neutral-300 text-xs font-bold transition-transform duration-200 ${isOpen() ? 'rotate-180' : ''}`}>
                        {isOpen() ? '−' : '+'}
                      </span>
                    </button>
                    <div
                      class="grid transition-all duration-300 ease-out"
                      style={{
                        'grid-template-rows': isOpen() ? '1fr' : '0fr',
                        opacity: isOpen() ? '1' : '0',
                      }}
                    >
                      <div class="overflow-hidden">
                        <p class="mt-3 text-xs sm:text-sm text-neutral-400 leading-relaxed pr-4">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Soothing Signal Pattern (Image 2 Reference) */}
          <div class="lg:col-span-6">
            <div
              class="relative h-[440px] sm:h-[480px] w-full rounded-sm overflow-hidden flex items-center justify-center p-6 shadow-2xl"
              style={{ background: ATMOSPHERIC_GRADIENTS.featureSplit }}
            >
              {/* Signal Dot Matrix (Image 2) */}
              <div
                class="absolute inset-0 pointer-events-none"
                style={SIGNAL_DOT_PATTERNS.featureSplit}
              />
              {/* Noise Grain */}
              <div
                class="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                style={{ 'background-image': NOISE_SVG, 'background-size': '150px 150px' }}
              />

              {/* Elevated Telemetry Panel */}
              <div class="relative z-10 w-full max-w-[340px] rounded-sm bg-[#12141a]/95 p-6 shadow-2xl backdrop-blur-2xl border border-white/5">
                <div class="flex items-center justify-between text-xs text-neutral-400">
                  <span class="font-medium text-neutral-200">Live Telemetry & Diagnostics</span>
                  <span class="size-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                <div class="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <div class="text-2xl font-bold font-mono text-white">99.8%</div>
                    <div class="text-[11px] text-neutral-400 mt-1">Socket response speed</div>
                    <div class="text-[10px] text-emerald-400 mt-0.5">↑ 0.2ms latency</div>
                  </div>
                  <div>
                    <div class="text-2xl font-bold font-mono text-white">14.2 MB</div>
                    <div class="text-[11px] text-neutral-400 mt-1">Memory allocation</div>
                    <div class="text-[10px] text-emerald-400 mt-0.5">Minimal host footprint</div>
                  </div>
                </div>

                {/* Micro Metric Stream */}
                <div class="mt-6 pt-5 border-t border-neutral-800/80 space-y-2.5">
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span class="text-neutral-400 flex items-center gap-1.5">
                      <span class="size-1.5 rounded-full bg-blue-400" />
                      beacon-server
                    </span>
                    <span class="text-neutral-300">0.4% • 14 MB</span>
                  </div>
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span class="text-neutral-400 flex items-center gap-1.5">
                      <span class="size-1.5 rounded-full bg-sky-400" />
                      postgres-db
                    </span>
                    <span class="text-neutral-300">1.2% • 48 MB</span>
                  </div>
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span class="text-neutral-400 flex items-center gap-1.5">
                      <span class="size-1.5 rounded-full bg-red-400" />
                      redis-cache
                    </span>
                    <span class="text-neutral-300">0.1% • 10 MB</span>
                  </div>
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span class="text-neutral-400 flex items-center gap-1.5">
                      <span class="size-1.5 rounded-full bg-emerald-400" />
                      nginx-proxy
                    </span>
                    <span class="text-neutral-300">0.3% • 12 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
