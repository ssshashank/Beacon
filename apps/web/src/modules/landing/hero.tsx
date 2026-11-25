import { createSignal } from 'solid-js';
import HeroDemo from './heroDemo';
import { ATMOSPHERIC_GRADIENTS, STIPPLE_NOISE_SVG } from './patterns';

const DOCKER_COMMAND = 'docker run -d --name beacon -p 8000:8000 -v /var/run/docker.sock:/var/run/docker.sock beacon:latest';

export default function Hero() {
  const [mode, setMode] = createSignal<'containers' | 'logs'>('containers');
  const [copied, setCopied] = createSignal(false);

  const copyCommand = () => {
    navigator.clipboard.writeText(DOCKER_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section class="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Editorial Headline & Value Summary */}
      <div class="text-center max-w-3xl mx-auto">
        {/* Badge */}
        <div class="inline-flex items-center gap-2 rounded-sm bg-white/5 px-3 py-1 text-[11px] font-medium text-neutral-300 shadow-sm">
          <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Zero-Config</span>
          <span class="text-neutral-600">•</span>
          <span class="text-neutral-300">Real-time Telemetry</span>
          <span class="text-neutral-600">•</span>
          <span class="text-neutral-400">Single Binary</span>
        </div>

        {/* Crisp Modern Headline */}
        <h1 class="mt-6 text-3xl sm:text-5xl lg:text-[3.25rem] font-semibold leading-[1.12] tracking-tight text-white">
          All-in-one Docker monitoring, built for simplicity.
        </h1>

        {/* Subtitle */}
        <p class="mt-4 text-sm sm:text-base leading-relaxed text-[#a1a1aa] max-w-xl mx-auto">
          Inspect containers, stream real-time logs, and monitor host resource utilization—all with a single lightweight container without bloated agents.
        </p>

        {/* One-click Docker run command */}
        <div class="mt-7 max-w-lg mx-auto flex items-center justify-between gap-2 rounded-sm bg-[#12141a] px-3.5 py-2 text-left shadow-lg">
          <span class="font-mono text-[11px] text-[#e4e4e7] truncate">
            <span class="text-blue-400 select-none mr-1.5 font-bold">$</span>
            {DOCKER_COMMAND}
          </span>
          <button
            type="button"
            onClick={copyCommand}
            class="shrink-0 rounded-sm bg-white/10 px-2.5 py-1 text-[11px] font-medium text-neutral-200 hover:text-white hover:bg-white/20 transition cursor-pointer"
          >
            {copied() ? 'Copied! ✓' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Segmented Mode Switcher */}
      <div class="mt-12 mb-5 flex justify-center">
        <div class="inline-flex rounded-sm bg-[#12141a] p-1 shadow-md">
          <button
            type="button"
            onClick={() => setMode('containers')}
            class={`rounded-sm px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
              mode() === 'containers'
                ? 'bg-white text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Live Containers
          </button>
          <button
            type="button"
            onClick={() => setMode('logs')}
            class={`rounded-sm px-4 py-1.5 text-xs font-medium transition cursor-pointer ${
              mode() === 'logs'
                ? 'bg-white text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Real-time Logs
          </button>
        </div>
      </div>

      {/* Showcase Frame with Soft Cosmos Particulate & Analog Stipple Texture (Pinterest/Cosmos Reference) */}
      <div class="relative w-full overflow-hidden rounded-sm bg-[#090a0f] p-2 sm:p-3 lg:p-4 shadow-2xl shadow-black/80">
        {/* Soft Cosmos Particulate Gradient (Warm Copper / Cobalt Indigo Glow) */}
        <div
          class="absolute inset-0 pointer-events-none"
          style={{
            background: ATMOSPHERIC_GRADIENTS.heroCosmosParticulate,
          }}
        />

        {/* Soft Micro-Stipple Analog Particle Grain (Zero Sharp/Harsh Dots) */}
        <div
          class="absolute inset-0 pointer-events-none mix-blend-screen opacity-20"
          style={{
            'background-image': STIPPLE_NOISE_SVG,
            'background-size': '180px 180px',
            'mask-image': 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 30%, transparent 85%)',
            '-webkit-mask-image': 'radial-gradient(ellipse 80% 70% at 50% 50%, #000 30%, transparent 85%)',
          }}
        />

        {/* Ambient Subtle Vignette & Glow */}
        <div class="absolute inset-0 bg-radial from-transparent via-[#090a0f]/20 to-[#090a0f]/75 pointer-events-none" />

        {/* Centered Elevated Mockup Card */}
        <div class="relative z-10 w-full rounded-sm bg-[#0b0c0f] shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden">
          <HeroDemo mode={mode()} />
        </div>
      </div>

      {/* Technology Bar */}
      <div class="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2.5 text-xs font-mono text-neutral-400">
        <span class="text-neutral-500 uppercase tracking-wider text-[10px]">Engine Stack</span>
        <span class="flex items-center gap-1.5 hover:text-white transition">
          <span class="size-1.5 rounded-full bg-blue-500" /> Docker Engine API
        </span>
        <span class="flex items-center gap-1.5 hover:text-white transition">
          <span class="size-1.5 rounded-full bg-orange-500" /> Rust (Axum)
        </span>
        <span class="flex items-center gap-1.5 hover:text-white transition">
          <span class="size-1.5 rounded-full bg-sky-500" /> SolidJS
        </span>
        <span class="flex items-center gap-1.5 hover:text-white transition">
          <span class="size-1.5 rounded-full bg-emerald-500" /> Unix Sockets
        </span>
      </div>
    </section>
  );
}
