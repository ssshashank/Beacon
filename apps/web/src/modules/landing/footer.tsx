export default function Footer() {
  return (
    <footer class="bg-[#060709] pt-16 pb-12 text-[#a1a1aa]">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="grid gap-10 md:grid-cols-4 pb-12">
          {/* Col 1 */}
          <div class="md:col-span-2">
            <div class="flex items-center gap-2.5">
              <div class="flex size-7 items-center justify-center rounded-sm bg-white text-neutral-950 font-extrabold text-xs shadow-md">
                B
              </div>
              <span class="text-base font-semibold tracking-tight text-white">Beacon</span>
            </div>
            <p class="mt-4 max-w-sm text-sm text-[#a1a1aa] leading-relaxed">
              Lightweight, real-time Docker container monitoring and log viewer. Single-container zero-config architecture built on Rust and SolidJS.
            </p>
            <div class="mt-5 flex gap-2 text-[11px] text-neutral-400 font-mono">
              <span class="rounded-sm bg-white/5 px-2 py-0.5">MIT Licensed</span>
              <span class="rounded-sm bg-white/5 px-2 py-0.5">Zero-Config</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-white">Product</h4>
            <ul class="mt-4 flex flex-col gap-2.5 text-sm text-[#a1a1aa]">
              <li><a href="/containers" class="hover:text-white no-underline transition">Dashboard</a></li>
              <li><a href="#features" class="hover:text-white no-underline transition">Features</a></li>
              <li><a href="#architecture" class="hover:text-white no-underline transition">Architecture</a></li>
              <li><a href="#quickstart" class="hover:text-white no-underline transition">Quick Start</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 class="text-xs font-semibold uppercase tracking-wider text-white">Resources</h4>
            <ul class="mt-4 flex flex-col gap-2.5 text-sm text-[#a1a1aa]">
              <li><a href="https://github.com/ssshashank/Beacon" target="_blank" class="hover:text-white no-underline transition">GitHub</a></li>
              <li><a href="https://docs.docker.com/engine/api/" target="_blank" class="hover:text-white no-underline transition">Docker API</a></li>
              <li><a href="#quickstart" class="hover:text-white no-underline transition">Quick Start</a></li>
              <li><a href="#faq" class="hover:text-white no-underline transition">FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-neutral-500 font-mono">
          <p>© 2026 Beacon. All rights reserved.</p>
          <p>Powered by Rust (Axum) and SolidJS.</p>
        </div>

        {/* Massive Editorial Watermark */}
        <div class="mt-12 overflow-hidden text-center select-none pointer-events-none">
          <span class="inline-block whitespace-nowrap font-extrabold tracking-widest text-white/[0.04] text-[8.5vw] md:text-[9.5vw] leading-none">
            BEACON
          </span>
        </div>
      </div>
    </footer>
  );
}
