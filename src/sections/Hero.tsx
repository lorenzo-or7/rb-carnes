import { useLayoutEffect, useRef } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { gsap } from '../app/gsap';
import { useTheme } from '../app/theme';
import { useConcierge } from '../concierge/ConciergeContext';

/**
 * Hero — Editorial Split Premium (direção inspirada no Savoria, com identidade RB).
 * Coluna de texto (~44%) + painel visual (~56%) que sangra até a borda direita.
 * A arte oficial (1672×941) é exibida inteira, ancorada na base do painel; o respiro acima
 * é a continuação do próprio céu da arte, e a borda superior da foto se dissolve nele.
 * As duas artes ocupam o mesmo quadro e trocam por crossfade sincronizado com o tema.
 */
const ART = {
  dark: { base: '/assets/hero/hero-dark', max: 1672, alt: 'RB Carnes: peça de carne marmorizada sobre tábua de madeira, com tecido vermelho e ilustração de boi ao fundo' },
  light: { base: '/assets/hero/hero-light', max: 1671, alt: 'RB Carnes: peça de carne marmorizada sobre tábua de madeira, em fundo claro com ilustração de boi' },
} as const;

function HeroArt({ variant, active }: { variant: 'dark' | 'light'; active: boolean }) {
  const a = ART[variant];
  const set = (ext: string) => `${a.base}-800.${ext} 800w, ${a.base}-1280.${ext} 1280w, ${a.base}-${a.max}.${ext} ${a.max}w`;
  const sizes = '(max-width: 1023px) 100vw, 56vw';
  return (
    <picture className={`hero__art hero__art--${variant}`} aria-hidden={!active}>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`${a.base}-1280.jpg`}
        alt={active ? a.alt : ''}
        width={a.max}
        height={941}
        decoding={active ? 'sync' : 'async'}
        // @ts-expect-error fetchpriority ainda não tipado no React 18
        fetchpriority={active ? 'high' : 'low'}
      />
    </picture>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const { theme } = useTheme();
  const { open } = useConcierge();

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' },
        (c) => {
          const { motion, desktop } = c.conditions as { motion: boolean; desktop: boolean };
          if (!motion) return;
          el.classList.add('hero--intro');
          const visual = el.querySelector<HTMLElement>('.hero__visual');
          const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
          // 1 · A fotografia surge por uma máscara de borda suave, com leve aproximação.
          tl.fromTo(visual, { '--reveal': '0%' }, {
            '--reveal': '128%',
            duration: 1.25,
            ease: 'power3.inOut',
            onComplete: () => el.classList.remove('hero--intro'),
          }, 0)
            .fromTo('.hero__arts', { scale: 1.06 }, { scale: 1, duration: 1.8, ease: 'power3.out' }, 0)
            // 2 · Headline progressiva, linha a linha.
            .from('.hero__eyebrow', { opacity: 0, x: -12, duration: 0.8, ease: 'power3.out' }, 0.15)
            .from('.hero__line > span', { yPercent: 108, duration: 1.05, stagger: 0.09 }, 0.22)
            // 3 · Descrição com leve movimento vertical.
            .from('.hero__lead', { opacity: 0, y: 14, duration: 0.9, ease: 'power3.out' }, 0.5)
            // 4 · CTAs com atraso sutil.
            .from('.hero__ctas > *', { opacity: 0, y: 12, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.62)
            // 5 · Detalhes editoriais completam a composição.
            .from('.hero__rule', { scaleX: 0, duration: 1, ease: 'power3.inOut' }, 0.7)
            .from('.hero__meta > *:not(.hero__rule)', { opacity: 0, y: 8, duration: 0.7, stagger: 0.06, ease: 'power2.out' }, 0.86)
            .from('.hero__caption', { opacity: 0, x: 10, duration: 0.8, ease: 'power2.out' }, 0.95);

          if (desktop) {
            // Parallax discreto da foto e saída suave do texto rumo ao manifesto.
            gsap.to('.hero__arts', { yPercent: 5, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.4 } });
            gsap.to('.hero__body', { y: -36, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.4 } });
          }
          return () => el.classList.remove('hero--intro');
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="inicio" ref={root} className="hero" aria-labelledby="hero-title" tabIndex={-1}>
      <div className="hero__text">
        <div className="hero__body">
          <p className="eyebrow hero__eyebrow">Distribuição e soluções para Food Service</p>
          <h1 id="hero-title" className="serif hero__h1">
            <span className="hero__line">
              <span>A excelência</span>
            </span>{' '}
            <span className="hero__line">
              <span>
                <em>tem origem.</em>
              </span>
            </span>
          </h1>
          <p className="hero__lead">
            Tradição, padrão e cortes preparados para operações profissionais. A RB Carnes abastece cozinhas que não podem parar.
          </p>
          <div className="hero__ctas">
            <a href="#produtos" className="btn btn--primary">
              Conheça nossos produtos <ArrowRight aria-hidden="true" />
            </a>
            <button type="button" className="btn btn--link" onClick={() => open()}>
              <span>Solicitar orçamento</span>
            </button>
          </div>
        </div>
        <div className="hero__meta">
          <span className="hero__rule" aria-hidden="true" />
          <p className="hero__meta-item">
            <strong>Desde 2001</strong>
            <span>São José · SC</span>
          </p>
          <p className="hero__meta-item">
            <strong>B2B</strong>
            <span>Food service</span>
          </p>
          <a href="#manifesto" className="hero__scroll" aria-label="Rolar para a próxima seção">
            <span aria-hidden="true">Role</span>
            <ArrowDown aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="hero__visual">
        {/* Céu contínuo derivado da borda superior de cada arte (crossfade com o tema). */}
        <div className="hero__sky hero__sky--dark" aria-hidden="true" />
        <div className="hero__sky hero__sky--light" aria-hidden="true" />
        <p className="hero__caption" aria-hidden="true">
          01 — Origem
        </p>
        <div className="hero__stage">
          <div className="hero__arts">
            <HeroArt variant="dark" active={theme === 'dark'} />
            <HeroArt variant="light" active={theme === 'light'} />
          </div>
        </div>
      </div>
    </section>
  );
}
