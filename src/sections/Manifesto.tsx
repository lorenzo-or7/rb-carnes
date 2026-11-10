import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { gsap } from '../app/gsap';
import { company } from '../data/company';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useMediaQuery';

const ATTRS = ['Produto + Serviço + Praticidade', 'Cortes padronizados', 'Porcionamento sob medida', 'Food service', 'Bovinos e suínos', 'Desde 2001'];

/** Ilustrações editoriais fornecidas pelo cliente — o lettering já faz parte da arte. */
const SLIDES = [
  { id: 'carnes', label: 'Carnes', alt: 'Ilustração em vermelho e preto com cabeça de boi, paisagem rural e a palavra Carnes' },
  { id: 'tempo', label: 'Tempo', alt: 'Ilustração em vermelho e preto com ampulheta, paisagem rural e a palavra Tempo' },
  { id: 'solucoes', label: 'Soluções', alt: 'Ilustração em vermelho e preto com aperto de mãos e a palavra Soluções' },
];
const INTERVAL = 5200;

const POINTS = [
  'Seleção de cortes bovinos e suínos para cozinhas profissionais.',
  'Bifes, cubos, tiras e moída no formato que a ficha técnica pede.',
  'Menos preparo na bancada, mais atenção ao serviço.',
];

function Slideshow() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { rootMargin: '0px' });
  const [hovering, setHovering] = useState(false);
  const running = playing && !reduced && visible && !hovering;

  const go = useCallback((n: number) => setIndex((n + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [running, index, go]);

  return (
    <div
      ref={ref}
      className={`slides ${running ? 'is-running' : ''}`}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Ilustrações do manifesto"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={() => setHovering(false)}
    >
      <div className="slides__frame">
        {SLIDES.map((s, i) => (
          <figure
            key={s.id}
            className={`slides__slide ${i === index ? 'is-active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${SLIDES.length}: ${s.label}`}
            aria-hidden={i !== index}
          >
            <picture>
              <source type="image/avif" srcSet={`/assets/manifesto/${s.id}-560.avif 560w, /assets/manifesto/${s.id}-860.avif 860w, /assets/manifesto/${s.id}-1106.avif 1106w`} sizes="(max-width: 1023px) 88vw, 34vw" />
              <source type="image/webp" srcSet={`/assets/manifesto/${s.id}-560.webp 560w, /assets/manifesto/${s.id}-860.webp 860w, /assets/manifesto/${s.id}-1106.webp 1106w`} sizes="(max-width: 1023px) 88vw, 34vw" />
              <img src={`/assets/manifesto/${s.id}-860.jpg`} alt={s.alt} width={1106} height={1422} loading="lazy" decoding="async" />
            </picture>
          </figure>
        ))}
      </div>

      <div className="slides__controls">
        <div className="slides__progress" aria-hidden="true">
          {SLIDES.map((s, i) => (
            <span key={s.id} className={`slides__bar ${i === index ? 'is-active' : ''} ${i < index ? 'is-done' : ''}`} style={{ animationDuration: `${INTERVAL}ms` }}>
              <span />
            </span>
          ))}
        </div>
        <p className="slides__count" aria-live="polite">
          <span>0{index + 1}</span> / 0{SLIDES.length} · {SLIDES[index].label}
        </p>
        <div className="slides__buttons">
          <button type="button" className="icon-btn icon-btn--sm" onClick={() => go(index - 1)} aria-label="Ilustração anterior">
            <ChevronLeft aria-hidden="true" />
          </button>
          {!reduced && (
            <button type="button" className="icon-btn icon-btn--sm" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pausar apresentação' : 'Retomar apresentação'} aria-pressed={!playing} data-testid="slides-toggle">
              {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            </button>
          )}
          <button type="button" className="icon-btn icon-btn--sm" onClick={() => go(index + 1)} aria-label="Próxima ilustração" data-testid="slides-next">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        // Revelação progressiva da declaração, frase a frase, sincronizada ao scroll.
        gsap.fromTo(
          '.mline',
          { '--lit': 0 },
          { '--lit': 1, ease: 'none', stagger: 0.35, scrollTrigger: { trigger: '.manifesto__statement', start: 'top 82%', end: 'bottom 52%', scrub: true } },
        );
        gsap.from('.slides', { y: 60, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.slides', start: 'top 85%' } });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="manifesto" ref={root} className="manifesto" aria-labelledby="manifesto-title" tabIndex={-1}>
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map((k) => (
            <ul role="list" key={k}>
              {ATTRS.map((a) => (
                <li key={a}>
                  <span className="serif">{a}</span>
                  <span className="marquee__dot" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <div className="container manifesto__grid">
        <div className="manifesto__copy">
          <p className="eyebrow">Manifesto comercial</p>
          <h2 id="manifesto-title" className="serif manifesto__statement">
            <span className="mline">Não vendemos apenas carne.</span>{' '}
            <span className="mline">
              Entregamos <em>soluções</em> para a sua operação.
            </span>{' '}
            <span className="mline">
              E devolvemos <em>tempo</em> à sua cozinha.
            </span>
          </h2>
          <ol className="manifesto__points">
            {POINTS.map((p, i) => (
              <li key={p}>
                <span className="manifesto__idx">0{i + 1}</span>
                {p}
              </li>
            ))}
          </ol>
          <p className="manifesto__slogan serif">
            <em>{company.slogan}</em>
          </p>
        </div>
        <Slideshow />
      </div>
    </section>
  );
}
