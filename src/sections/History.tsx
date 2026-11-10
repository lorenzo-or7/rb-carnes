import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../app/gsap';
import { AnimatedContent } from '../components/AnimatedContent';
import { chapterAt, chapters, historyChapters, WINDOWS } from '../data/timeline';
import { useIsDesktop, useReducedMotion } from '../hooks/useMediaQuery';

/**
 * O Corte do Tempo — Living Archive.
 * Storytelling editorial sem 3D: o "corte" virou linguagem visual — máscaras diagonais,
 * linha dourada que atravessa o quadro e ano cinético. Imagens conceituais (ilustrativas),
 * nunca apresentadas como registro documental da empresa.
 */
const NAMES = ['O início', 'A expansão', 'Um novo capítulo'];

/** Mídia do capítulo: foto quando houver caminho; caso contrário, quadro reservado editorial. */
function ChapterMedia({ i }: { i: number }) {
  const img = historyChapters[i].image;
  if (img) return <img src={img.src} alt={img.alt} width={img.width} height={img.height} loading="lazy" decoding="async" />;
  return (
    <div className="archive__placeholder" role="img" aria-label={`Espaço reservado para imagem do capítulo ${historyChapters[i].year}`}>
      <span className="archive__ph-year serif" aria-hidden="true">{historyChapters[i].year}</span>
      <span className="archive__ph-note">Imagem conceitual futura</span>
    </div>
  );
}

function Year({ year, on }: { year: string; on: boolean }) {
  return (
    <span className={`kyear ${on ? 'is-on' : ''}`} aria-hidden="true">
      {year.split('').map((d, k) => (
        <span key={k} className="kyear__d" style={{ transitionDelay: `${on ? k * 70 : 0}ms` }}>
          {d}
        </span>
      ))}
    </span>
  );
}

export function History() {
  const root = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  const scrub = desktop && !reduced;

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !scrub) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const idx = chapterAt(self.progress);
          setActive((prev) => (prev === idx ? prev : idx));
          railRef.current?.style.setProperty('--p', String(self.progress));
        },
      });
      // Parallax controlado do arquivo fotográfico.
      gsap.fromTo('.archive__photos', { yPercent: 4 }, { yPercent: -4, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: true } });
      gsap.fromTo('.archive__intro .kline > span', { yPercent: 110 }, { yPercent: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 70%' } });
    }, el);
    return () => ctx.revert();
  }, [scrub]);

  const jumpTo = useCallback(
    (i: number) => {
      const el = root.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const range = el.offsetHeight - window.innerHeight;
      const [a, b] = WINDOWS[i];
      window.scrollTo({ top: top + range * (a + (Math.min(b, 0.98) - a) * 0.4), behavior: reduced ? 'auto' : 'smooth' });
    },
    [reduced],
  );

  if (!scrub) {
    return (
      <section id="historia" ref={root} className="archive archive--stack section" aria-labelledby="history-title" tabIndex={-1}>
        <div className="container">
          <header className="archive__intro">
            <p className="eyebrow">Nossa história · Living Archive</p>
            <h2 id="history-title" className="serif archive__title">
              O Corte <em>do Tempo</em>
            </h2>
            <p className="archive__sub serif">Desde 2001, cortando com propósito.</p>
            <p className="lead">Uma história construída corte a corte.</p>
          </header>
          <ol className="archive__list">
            {chapters.map((c, i) => (
              <li key={c.year} className="archive__item">
                <AnimatedContent variant="clip" className="archive__media">
                  <ChapterMedia i={i} />
                </AnimatedContent>
                <AnimatedContent className="archive__body">
                  <p className="archive__label">
                    {c.label} · {NAMES[i]}
                  </p>
                  <p className="archive__year serif" aria-hidden="true">
                    {c.year}
                  </p>
                  <h3 className="serif h3">{c.title}</h3>
                  <p className="archive__text">{c.text}</p>
                  <p className="note">{c.source}</p>
                </AnimatedContent>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section id="historia" ref={root} className="archive archive--scrub" aria-labelledby="history-title" tabIndex={-1} data-active={active}>
      <div className="archive__stage">
        <div className="container archive__layout">
          <div className="archive__copy">
            <header className={`archive__intro ${active >= 0 ? 'is-out' : ''}`}>
              <p className="eyebrow">Nossa história · Living Archive</p>
              <h2 id="history-title" className="serif archive__title">
                <span className="kline">
                  <span>O Corte</span>
                </span>{' '}
                <span className="kline">
                  <span>
                    <em>do Tempo</em>
                  </span>
                </span>
              </h2>
              <p className="archive__sub serif">Desde 2001, cortando com propósito.</p>
              <p className="lead">Uma história construída corte a corte. Role para atravessar os três capítulos.</p>
            </header>

            <ol className="archive__chapters">
              {chapters.map((c, i) => (
                <li key={c.year} className={`archive__chapter ${active === i ? 'is-active' : ''}`} aria-current={active === i ? 'step' : undefined}>
                  <p className="archive__label">
                    {c.label} · {NAMES[i]}
                  </p>
                  <p className="archive__year serif">
                    <Year year={c.year} on={active === i} />
                    <span className="sr-only">{c.year}</span>
                  </p>
                  <h3 className="serif h3">{c.title}</h3>
                  <p className="archive__text">{c.text}</p>
                  <p className="note archive__source">{c.source}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="archive__visual">
            <div className="archive__photos">
              {historyChapters.map((_, i) => (
                <figure key={i} className={`archive__photo ${i === active ? 'is-active' : ''} ${i < active ? 'is-past' : ''}`} aria-hidden={i !== active}>
                  <ChapterMedia i={i} />
                </figure>
              ))}
              <div className={`archive__cover ${active < 0 ? 'is-on' : ''}`} aria-hidden="true">
                <span className="serif">2001 — 2021</span>
              </div>
              {active >= 0 && !reduced && <span key={active} className="archive__cut" aria-hidden="true" />}
            </div>
          </div>
        </div>

        <nav ref={railRef} className="container archive__rail" aria-label="Capítulos da história">
          <span className="archive__rail-track" aria-hidden="true">
            <span />
          </span>
          {chapters.map((c, i) => (
            <button key={c.year} type="button" className={`archive__tick ${active >= i ? 'is-past' : ''} ${active === i ? 'is-on' : ''}`} onClick={() => jumpTo(i)} aria-label={`Ir para ${c.year}: ${NAMES[i]}`}>
              <span className="archive__tick-year serif">{c.year}</span>
              <span className="archive__tick-name">{NAMES[i]}</span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
