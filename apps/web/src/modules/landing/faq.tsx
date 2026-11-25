import { createSignal } from 'solid-js';

export default function FAQ() {
  const [openIndex, setOpenIndex] = createSignal<number | null>(0);

  const faqs = [
    {
      q: 'How is Beacon different from heavy management platforms?',
      a: 'Traditional management platforms require external databases, user authentication layers, heavy agents, and extensive setup. Beacon is completely stateless, running as a single ultra-lightweight (< 15MB) container that connects directly to your Docker socket with instant load times.',
    },
    {
      q: 'Does Beacon need an external database or Redis?',
      a: 'No. Beacon is completely stateless. It queries the Docker Engine API directly through /var/run/docker.sock and streams logs and events in real-time. Nothing is stored on disk.',
    },
    {
      q: 'Can I host Beacon behind a reverse proxy (Nginx, Traefik, Caddy)?',
      a: 'Yes! Beacon uses relative API endpoints (/api/v1), so it works out of the box behind any reverse proxy, subpath, or custom domain without extra CORS configuration.',
    },
    {
      q: 'What permissions does Beacon need?',
      a: 'Beacon only requires read access to the Docker daemon Unix socket (/var/run/docker.sock) to inspect containers, images, volumes, and stream live events.',
    },
    {
      q: 'Is Beacon free and open-source?',
      a: 'Yes, Beacon is 100% open-source licensed under MIT. You can freely use, modify, and self-host it anywhere.',
    },
  ];

  return (
    <section id="faq" class="py-20 md:py-28 bg-[#08090c] text-[#f5f5f7]">
      <div class="mx-auto max-w-4xl px-6 lg:px-8">
        <div class="text-center">
          <div class="inline-flex items-center gap-2 rounded-sm bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300">
            <span class="size-1.5 rounded-full bg-[#ff5500]" />
            FAQ
          </div>
          <h2 class="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p class="mt-4 text-base text-neutral-400">
            Common questions about running and configuring Beacon.
          </p>
        </div>

        {/* Borderless FAQ items with smooth animation */}
        <div class="mt-12 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = () => openIndex() === idx;
            return (
              <div class="rounded-sm bg-[#12141a] p-5 sm:p-6 transition hover:bg-[#161822]">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen() ? null : idx)}
                  class="flex w-full items-center justify-between text-left cursor-pointer"
                >
                  <span class="text-sm sm:text-base font-semibold text-white">{faq.q}</span>
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
                    <p class="mt-3 text-sm leading-relaxed text-neutral-400">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
