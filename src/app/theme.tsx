import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'dark' | 'light';
const KEY = 'rb-theme';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}
const Ctx = createContext<ThemeCtx | null>(null);

function readInitial(): Theme {
  const attr = document.documentElement.dataset.theme;
  return attr === 'light' ? 'light' : 'dark';
}

function hasExplicit() {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark';
  } catch {
    return false;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitial);

  useEffect(() => {
    const html = document.documentElement;
    // Só anima uma troca real (o tema inicial já vem aplicado pelo script do index.html).
    if (html.dataset.theme === theme) return;
    // Durante a troca, cores, fundos e bordas de toda a página fazem o mesmo crossfade
    // (0,85 s) das artes do hero e da navbar — sem saltos isolados.
    html.classList.add('theme-anim');
    html.dataset.theme = theme;
    const t = window.setTimeout(() => html.classList.remove('theme-anim'), 900);
    return () => {
      window.clearTimeout(t);
      html.classList.remove('theme-anim');
    };
  }, [theme]);

  // Segue o sistema enquanto não houver preferência explícita.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      if (!hasExplicit()) setThemeState(mq.matches ? 'light' : 'dark');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* armazenamento indisponível: mantém só na sessão */
    }
  }, []);
  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

  return <Ctx.Provider value={{ theme, toggle, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTheme fora do ThemeProvider');
  return c;
}
