import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion as useMotionReduced } from 'motion/react';
import { gsap } from '../app/gsap';
import { ScenePicture } from '../components/Picture';
import { solutions } from '../data/solutions';
import { useConcierge } from '../concierge/ConciergeContext';

const BENEFITS = [
  { k: 'Praticidade operacional', t: 'A carne chega pronta para a etapa de cocção. A equipe ganha tempo para o serviço.' },
  { k: 'Cortes padronizados', t: 'Bifes, cubos e tiras com a mesma medida em todos os pedidos.' },
  { k: 'Preparação personalizada', t: 'Formato, gramatura e porção combinados com a sua ficha técnica.' },
  { k: 'Consistência', t: 'O prato sai igual em qualquer turno, com custo por porção previsível.' },
  { k: 'Menos manipulação', t: 'Menos limpeza, aparas e porcionamento dentro da cozinha.' },
  { k: 'Preparo organizado', t: 'Recebimento e mise en place mais simples, com menos etapas na bancada.' },
];

function Benefits() {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.matchMedia().add({ motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 1024px)' }, (c) => {
        const { motion, wide } = c.conditions as { motion: boolean; wide: boolean };
        if (!motion) return;
        gsap.from('.benefits__intro > *', { y: 18, opacity: 0, duration: 0.85, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 78%', once: true } });
        if (wide) {
          // Desktop: a régua dourada abre a grade, depois os itens em ordem de leitura (linha a linha).
          gsap
            .timeline({ scrollTrigger: { trigger: '.benefits__list', start: 'top 82%', once: true } })
            .fromTo('.benefits__list', { '--rule': 0 }, { '--rule': 1, duration: 1, ease: 'power3.inOut' })
            .from('.benefit', { y: 22, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.2)
            .from('.benefit__n', { opacity: 0, x: -8, duration: 0.6, stagger: 0.08, ease: 'power2.out' }, 0.35);
        } else {
          // Celular/tablet: lista em coluna; cada benefício se revela quando entra na tela, com movimento curto.
          gsap.fromTo('.benefits__list', { '--rule': 0 }, { '--rule': 1, duration: 0.9, ease: 'power3.inOut', scrollTrigger: { trigger: '.benefits__list', start: 'top 88%', once: true } });
          gsap.utils.toArray<HTMLElement>('.benefit').forEach((b) =>
            gsap.from(b, { y: 14, opacity: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: b, start: 'top 92%', once: true } }),
          );
        }
      });
      // Zoom lento da foto atrelado ao scroll só em telas largas; no celular a foto fica estável.
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', () => {
        gsap.fromTo('.benefits__visual img', { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={root} className="container benefits">
      <div className="benefits__intro">
        <p className="eyebrow">Food service</p>
        <h2 id="food-title" className="serif food__title">
          Mais tempo para <em>servir bem.</em>
        </h2>
        <p className="benefits__lead">Produto, serviço e praticidade: a peça chega no formato que a sua operação usa, e a cozinha deixa de gastar tempo com etapas que não aparecem no prato.</p>
        <figure className="benefits__visual">
          <ScenePicture slug="ato1-preparo" alt="Peça bovina crua sobre tábua em ambiente de preparo (imagem ilustrativa)" sizes="(max-width: 1023px) 92vw, 40vw" />
        </figure>
      </div>
      <ol className="benefits__list">
        {BENEFITS.map((b, i) => (
          <li key={b.k} className="benefit">
            <span className="benefit__n">0{i + 1}</span>
            <h3 className="serif benefit__k">{b.k}</h3>
            <p className="benefit__t">{b.t}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function InteractiveSolutions() {
  const [active, setActive] = useState(0);
  const { open } = useConcierge();
  const reduce = useMotionReduced();
  const s = solutions[active];

  return (
    <div className="solutions container" id="solucoes" tabIndex={-1}>
      <div className="solutions__head">
        <p className="eyebrow">Interactive Solutions</p>
        <h3 className="serif h2">
          Qual é a sua <em>operação?</em>
        </h3>
      </div>
      <div className="solutions__grid">
        <div className="solutions__tabs" role="tablist" aria-label="Tipos de operação" aria-orientation="vertical">
          {solutions.map((x, i) => (
            <button
              key={x.id}
              id={`sol-tab-${x.id}`}
              role="tab"
              type="button"
              aria-selected={active === i}
              aria-controls="sol-panel"
              tabIndex={active === i ? 0 : -1}
              className={`solutions__tab ${active === i ? 'is-on' : ''}`}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                const k = e.key;
                if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(k)) {
                  e.preventDefault();
                  let n = active;
                  if (k === 'ArrowDown' || k === 'ArrowRight') n = (active + 1) % solutions.length;
                  if (k === 'ArrowUp' || k === 'ArrowLeft') n = (active - 1 + solutions.length) % solutions.length;
                  if (k === 'Home') n = 0;
                  if (k === 'End') n = solutions.length - 1;
                  setActive(n);
                  document.getElementById(`sol-tab-${solutions[n].id}`)?.focus();
                }
              }}
            >
              <span className="solutions__tabnum">0{i + 1}</span>
              <span className="solutions__tablabel">{x.tab}</span>
              <span className="solutions__benefit">{x.benefit}</span>
            </button>
          ))}
        </div>

        <div id="sol-panel" role="tabpanel" aria-labelledby={`sol-tab-${s.id}`} className="solutions__panel" tabIndex={0}>
          <div className="solutions__media">
            <AnimatePresence initial={false}>
              <motion.div
                key={s.id}
                className="solutions__img"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0.01 : 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <ScenePicture slug={s.image} alt={s.imageAlt} sizes="(max-width: 1023px) 100vw, 40vw" />
              </motion.div>
            </AnimatePresence>
            <span className="solutions__badge">{s.benefit}</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={s.id}
              className="solutions__copy"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <h4 className="serif h3">{s.headline}</h4>
              <p>{s.text}</p>
              <ul role="list" className="solutions__items">
                {s.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
              <button type="button" className="btn btn--primary" onClick={() => open({ segment: s.segment })} data-testid="solution-cta">
                Encontrar minha solução <ArrowRight aria-hidden="true" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <p className="note">Imagens ilustrativas. Não retratam equipes, clientes, embalagens oficiais nem operações reais da RB Carnes.</p>
    </div>
  );
}

export function FoodService() {
  return (
    <section id="food-service" className="food" aria-labelledby="food-title" tabIndex={-1}>
      <div className="food__screen">
        <Benefits />
      </div>
      <InteractiveSolutions />
      <div className="container food__close">
        <p className="serif h2">
          Você cuida dos seus clientes. <em className="gold">A RB cuida da sua operação.</em>
        </p>
      </div>
    </section>
  );
}
