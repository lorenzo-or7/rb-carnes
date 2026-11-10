import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useConcierge } from '../concierge/ConciergeContext';
import { useScrollLock } from '../hooks/useScrollLock';

export const NAV_LINKS = [
  { href: '#produtos', label: 'Produtos' },
  { href: '#historia', label: 'Nossa História' },
  { href: '#qualidade', label: 'Qualidade' },
  { href: '#contato', label: 'Contato' },
];

/**
 * Navbar editorial com morphing ao rolar.
 * Base conceitual: Morphing Scroll Navbar (21st.dev / laziekiki), reescrita para o layout aprovado:
 * transparente sobre o hero → cápsula translúcida compacta ao rolar.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Fechamento suave: o painel permanece montado durante a animação de saída.
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const { open, state } = useConcierge();
  const count = state.items.length;

  useScrollLock(menuOpen);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
      setScrolled(y > 24);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const closeMenu = useCallback((restoreFocus = true) => {
    setMenuOpen(false);
    setClosing(true);
    window.clearTimeout(closeTimer.current);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    closeTimer.current = window.setTimeout(() => setClosing(false), reduce ? 0 : 280);
    if (restoreFocus) requestAnimationFrame(() => burgerRef.current?.focus());
  }, []);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  // Foco gerenciado + Escape + trap no menu mobile.
  useEffect(() => {
    if (!menuOpen) return;
    const root = menuRef.current;
    const focusables = () =>
      Array.from(root?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    requestAnimationFrame(() => focusables()[0]?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
      }
      if (e.key === 'Tab') {
        const f = focusables();
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  const goTo = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu(false);
    // Aguarda a restauração do scroll antes de navegar.
    requestAnimationFrame(() => {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', href);
      (el as HTMLElement | null)?.focus({ preventScroll: true });
    });
  };

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-menu' : ''}`}>
      <div className="nav__shell">
        <a href="#inicio" className="nav__brand" aria-label="RB Carnes — início" onClick={goTo('#inicio')}>
          <Logo size={scrolled ? 44 : 56} />
          <span className="nav__brand-meta" aria-hidden="true">
            <span>Food service</span>
            <span>São José · SC</span>
          </span>
        </a>
        <nav className="nav__links" aria-label="Principal">
          <ul role="list">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={goTo(l.href)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav__actions">
          <ThemeToggle />
          <button type="button" className="btn btn--ghost btn--sm nav__cta" onClick={() => open()} data-testid="nav-cta">
            Solicitar orçamento
            {count > 0 ? (
              <span className="nav__count" aria-label={`${count} ${count === 1 ? 'item' : 'itens'} na seleção`}>
                {count}
              </span>
            ) : (
              <ArrowUpRight aria-hidden="true" />
            )}
          </button>
          <button
            ref={burgerRef}
            type="button"
            className="nav__burger"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => {
              if (menuOpen) closeMenu();
              else {
                window.clearTimeout(closeTimer.current);
                setClosing(false);
                setMenuOpen(true);
              }
            }}
            data-testid="nav-burger"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
        <div className="nav__progress" aria-hidden="true">
          <div ref={progressRef} className="nav__progress-bar" />
        </div>
      </div>

      {(menuOpen || closing) && <div className={`mmenu-scrim ${closing ? 'is-closing' : ''}`} aria-hidden="true" onClick={() => closeMenu()} />}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={`mmenu ${closing ? 'is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!menuOpen && !closing}
        aria-hidden={closing ? true : undefined}
      >
        <div className="mmenu__inner">
          <p className="eyebrow">Navegação</p>
          <ul role="list" className="mmenu__links">
            {NAV_LINKS.map((l, i) => (
              <li key={l.href} style={{ '--i': i } as React.CSSProperties}>
                <a href={l.href} onClick={goTo(l.href)} className="serif">
                  <span className="mmenu__num">0{i + 1}</span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mmenu__foot">
            <div className="mmenu__theme">
              <span className="small muted">Tema</span>
              <ThemeToggle />
            </div>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                closeMenu(false);
                open();
              }}
            >
              Solicitar orçamento <ArrowUpRight aria-hidden="true" />
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => closeMenu()}>
              Fechar menu
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
