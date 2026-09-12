import { isServer } from '@solidjs/web';
import { Accessor } from 'solid-js';

export type Placement = 'top' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right';

export function createFloatingPopper(
  trigger: Accessor<HTMLElement | undefined>,
  content: Accessor<HTMLElement | undefined>,
  placement: Placement = 'bottom-start',
  offset = 8,
) {
  if (isServer) return () => {};

  const update = () => {
    const t = trigger();
    const c = content();
    if (!t || !c) return;

    const rect = t.getBoundingClientRect();
    const contentRect = c.getBoundingClientRect();

    let top = rect.bottom + offset;
    let left = rect.left;

    switch (placement) {
      case 'top':
        top = rect.top - contentRect.height - offset;
        left = rect.left;
        break;
      case 'bottom-end':
        left = rect.right - contentRect.width;
        break;
      case 'bottom-start':
        left = rect.left;
        break;
      case 'bottom':
        left = rect.left + (rect.width - contentRect.width) / 2;
        break;
      case 'left':
        left = rect.left - contentRect.width - offset;
        top = rect.top;
        break;
      case 'right':
        left = rect.right + offset;
        top = rect.top;
        break;
    }

    if (top + contentRect.height > window.innerHeight - 8) {
      top = rect.top - contentRect.height - offset;
    }

    if (left + contentRect.width > window.innerWidth - 8) {
      left = rect.right - contentRect.width;
    }

    if (left < 8) left = 8;
    if (top < 8) top = 8;

    c.style.position = 'fixed';
    c.style.top = `${top}px`;
    c.style.left = `${left}px`;
    c.style.zIndex = '9999';
    c.style.visibility = 'visible';
  };

  const c0 = content();
  if (c0) c0.style.visibility = 'hidden';

  update();
  const rafId = requestAnimationFrame(() => {
    update();
    requestAnimationFrame(update);
  });

  window.addEventListener('resize', update);
  window.addEventListener('scroll', update, true);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', update);
    window.removeEventListener('scroll', update, true);
  };
}
