import { ATMOSPHERIC_GRADIENTS, NOISE_SVG, SIGNAL_DOT_PATTERNS } from './patterns';

export default function ValueProps() {
  return (
    <section id="features" class="py-20 md:py-28 bg-[#08090c] text-[#f5f5f7]">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Top Tag & Split Header */}
        <div>
          <span class="inline-block rounded-sm bg-white/5 px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase text-neutral-400">
            Value Prop
          </span>
          <div class="mt-4 pt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white lg:col-span-7">
              Structure and clarity across every container
            </h2>
            <p class="text-sm sm:text-base leading-relaxed text-[#a1a1aa] lg:col-span-5">
              Beacon replaces fragmented monitoring agents with a structured, native system designed specifically for Docker workflows.
            </p>
          </div>
        </div>

        {/* 3 Distinct Atmospheric Visual Panels (Image 2 Style: Soothing Ambient + Signal Dots) */}
        <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Panel 1: Terracotta / Amber Signal Dots */}
          <div>
            <div
              class="relative h-[340px] sm:h-[380px] w-full rounded-sm overflow-hidden flex items-center justify-center p-6 shadow-xl"
              style={{ background: ATMOSPHERIC_GRADIENTS.panelTerracotta }}
            >
              {/* Signal Dot Matrix (Image 2 Reference) */}
              <div
                class="absolute inset-0 pointer-events-none"
                style={SIGNAL_DOT_PATTERNS.terracotta}
              />
              {/* Subtle Organic Grain */}
              <div
                class="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                style={{ 'background-image': NOISE_SVG, 'background-size': '140px 140px' }}
              />

              {/* Floating UI Widget */}
              <div class="relative z-10 w-full max-w-[260px] rounded-sm bg-[#12141a]/95 p-5 shadow-2xl backdrop-blur-xl border border-white/5">
                <div class="flex items-center justify-between text-xs text-[#a1a1aa]">
                  <span class="font-medium text-white">Container Journeys</span>
                  <span class="text-neutral-500 font-mono">•••</span>
                </div>
                <div class="mt-4">
                  <div class="flex items-baseline gap-2">
                    <span class="text-3xl font-bold text-white font-mono">24</span>
                    <span class="text-[11px] text-emerald-400 font-medium">↗ 18 healthy & running</span>
                  </div>
                  {/* Segmented Progress Bar */}
                  <div class="mt-3 flex h-2 w-full gap-1 overflow-hidden rounded-sm bg-neutral-800">
                    <div class="bg-emerald-500 rounded-sm" style={{ width: '70%' }} />
                    <div class="bg-amber-500 rounded-sm" style={{ width: '20%' }} />
                    <div class="bg-rose-500 rounded-sm" style={{ width: '10%' }} />
                  </div>
                  <div class="mt-3 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                    <span>• 18 Active</span>
                    <span>• 4 Paused</span>
                    <span>• 2 Stopped</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Below Panel 1 */}
            <div class="mt-4">
              <h3 class="text-base font-semibold text-white">Structured container insights</h3>
              <p class="mt-1 text-xs sm:text-sm leading-relaxed text-[#a1a1aa]">
                Standardize how containers are monitored through inspect metadata, process trees, and filesystem diffs, while retaining microsecond response times.
              </p>
            </div>
          </div>

          {/* Panel 2: Slate & Indigo Signal Dots */}
          <div>
            <div
              class="relative h-[340px] sm:h-[380px] w-full rounded-sm overflow-hidden flex items-center justify-center p-6 shadow-xl"
              style={{ background: ATMOSPHERIC_GRADIENTS.panelSlate }}
            >
              {/* Signal Dot Matrix (Image 2 Reference) */}
              <div
                class="absolute inset-0 pointer-events-none"
                style={SIGNAL_DOT_PATTERNS.slate}
              />
              {/* Subtle Organic Grain */}
              <div
                class="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                style={{ 'background-image': NOISE_SVG, 'background-size': '140px 140px' }}
              />

              {/* Floating UI Widget */}
              <div class="relative z-10 w-full max-w-[260px] rounded-sm bg-[#12141a]/95 p-5 shadow-2xl backdrop-blur-xl border border-white/5">
                <div class="flex items-center justify-between text-xs text-[#a1a1aa]">
                  <span class="font-medium text-white">CPU & Memory ▾</span>
                  <span class="text-neutral-500 font-mono text-[10px]">Real-time</span>
                </div>
                <div class="mt-3 flex flex-col items-center justify-center py-2">
                  <div class="rounded-sm bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 font-mono">
                    0.8% CPU load
                  </div>
                  {/* Visual Bar Graph */}
                  <div class="mt-3 flex items-end gap-2 h-14 w-full justify-center">
                    <div class="w-3 bg-neutral-700 rounded-sm h-[35%]" />
                    <div class="w-4 bg-blue-500 rounded-sm h-[90%]" />
                    <div class="w-3 bg-neutral-700 rounded-sm h-[50%]" />
                    <div class="w-3 bg-neutral-700 rounded-sm h-[20%]" />
                  </div>
                  <span class="mt-2 text-[10px] text-neutral-400 font-mono">34.4% memory allocated</span>
                </div>
              </div>
            </div>

            {/* Description Below Panel 2 */}
            <div class="mt-4">
              <h3 class="text-base font-semibold text-white">Real-time resource visibility</h3>
              <p class="mt-1 text-xs sm:text-sm leading-relaxed text-[#a1a1aa]">
                Track CPU utilization, memory thresholds, disk I/O, and socket throughput across all running instances so you never encounter silent OOM kills.
              </p>
            </div>
          </div>

          {/* Panel 3: Forest Green Signal Dots */}
          <div>
            <div
              class="relative h-[340px] sm:h-[380px] w-full rounded-sm overflow-hidden flex items-center justify-center p-6 shadow-xl"
              style={{ background: ATMOSPHERIC_GRADIENTS.panelForest }}
            >
              {/* Signal Dot Matrix (Image 2 Reference) */}
              <div
                class="absolute inset-0 pointer-events-none"
                style={SIGNAL_DOT_PATTERNS.forest}
              />
              {/* Subtle Organic Grain */}
              <div
                class="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                style={{ 'background-image': NOISE_SVG, 'background-size': '140px 140px' }}
              />

              {/* Floating UI Widget */}
              <div class="relative z-10 w-full max-w-[260px] rounded-sm bg-[#12141a]/95 p-5 shadow-2xl backdrop-blur-xl border border-white/5 text-center">
                <span class="inline-block rounded-sm bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                  Docker Daemon SSE
                </span>
                {/* Overlapping service pills */}
                <div class="mt-5 flex justify-center -space-x-1.5">
                  <div class="flex size-9 items-center justify-center rounded-sm bg-blue-600 text-xs font-bold text-white shadow-md">
                    B
                  </div>
                  <div class="flex size-9 items-center justify-center rounded-sm bg-sky-600 text-xs font-bold text-white shadow-md">
                    PG
                  </div>
                  <div class="flex size-9 items-center justify-center rounded-sm bg-red-600 text-xs font-bold text-white shadow-md">
                    RD
                  </div>
                  <div class="flex size-9 items-center justify-center rounded-sm bg-emerald-600 text-xs font-bold text-white shadow-md">
                    NX
                  </div>
                </div>
                <div class="mt-4 font-mono text-[11px] text-white">
                  Live socket events active
                </div>
              </div>
            </div>

            {/* Description Below Panel 3 */}
            <div class="mt-4">
              <h3 class="text-base font-semibold text-white">Seamless socket streaming</h3>
              <p class="mt-1 text-xs sm:text-sm leading-relaxed text-[#a1a1aa]">
                Developers and operations work from the exact same live Docker socket stream, reducing debugging handoffs, latency, and miscommunication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
