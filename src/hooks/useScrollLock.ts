import { useEffect } from 'react';

/** Trava o scroll do body e restaura a posição ao liberar. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const y = window.scrollY;
    const body = document.body;
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width };
    body.style.position = 'fixed';
    body.style.top = `-${y}px`;
    body.style.width = '100%';
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
    };
  }, [locked]);
}
