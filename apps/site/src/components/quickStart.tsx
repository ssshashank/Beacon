import { createSignal } from 'solid-js';

export default function QuickStart() {
  const [activeTab, setActiveTab] = createSignal<'cli' | 'compose' | 'just'>('cli');
  const [copied, setCopied] = createSignal(false);

  const snippets = {
    cli: `docker run -d \\
  --name beacon \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  -p 8000:8000 \\
  ssshashank/beacon:latest`,
    compose: `services:
  beacon:
    image: ssshashank/beacon:latest
    container_name: beacon
    ports:
      - "8000:8000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    restart: unless-stopped`,
    just: `# Production deployment (single container)
just prod-up

# Stop production
just prod-down

# View logs
just prod-logs`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(snippets[activeTab()]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="quickstart" class="py-20 md:py-28 bg-[#08090c] text-[#f5f5f7]">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 rounded-sm bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300">
            <span class="size-1.5 rounded-full bg-[#ff5500]" />
            Deployment
          </div>
          <h2 class="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Start monitoring in less than 30 seconds
          </h2>
          <p class="mt-4 text-base text-neutral-400">
            Choose your preferred command. Beacon starts with smart defaults out of the box.
          </p>
        </div>

        {/* Integrated Terminal Card without outline borders */}
        <div class="mt-12 overflow-hidden rounded-sm bg-[#12141a] shadow-2xl">
          <div class="flex items-center justify-between bg-[#0a0b0f] px-4 py-2.5">
            <div class="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('cli')}
                class={`rounded-xs px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  activeTab() === 'cli'
                    ? 'bg-white text-neutral-950 font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Docker CLI
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('compose')}
                class={`rounded-xs px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  activeTab() === 'compose'
                    ? 'bg-white text-neutral-950 font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Docker Compose
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('just')}
                class={`rounded-xs px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                  activeTab() === 'just'
                    ? 'bg-white text-neutral-950 font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Justfile
              </button>
            </div>
            <button
              type="button"
              onClick={copyCode}
              class="rounded-xs bg-white/10 px-3 py-1 text-xs font-medium text-neutral-200 hover:bg-white/20 active:scale-95 transition cursor-pointer"
            >
              {copied() ? 'Copied! ✓' : 'Copy'}
            </button>
          </div>
          <div class="p-6 overflow-x-auto bg-[#07080b]">
            <pre class="font-mono text-xs leading-relaxed text-blue-200">
              <code>{snippets[activeTab()]}</code>
            </pre>
          </div>
        </div>

        {/* Live notification pill */}
        <div class="mt-6 flex items-center justify-between rounded-sm bg-emerald-500/10 px-5 py-3.5 text-xs text-neutral-300">
          <div class="flex items-center gap-2.5">
            <span class="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Open{' '}
              <a
                href="http://localhost:8000"
                target="_blank"
                class="font-mono font-semibold text-emerald-400 underline hover:text-emerald-300"
              >
                http://localhost:8000
              </a>{' '}
              in your browser once started
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
