import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Plus } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Picture } from '../components/Picture';
import { categories, products, type CategoryId, type Product } from '../data/products';
import { useConcierge } from '../concierge/ConciergeContext';
import { ProductSpotlight } from './ProductSpotlight';

type Filter = 'todos' | CategoryId;

/** Seleção inicial curada (vitrine): o restante aparece por escolha do visitante. */
const CURATED = ['entrecote', 'contra-file', 'alcatra-miolo', 'fraldinha', 'bifes-padronizados', 'cubos', 'carne-moida', 'sobrepaleta-suina'];
const INITIAL = 8;

export function useRequestToggle() {
  const { addItem, removeItem, hasItem } = useConcierge();
  return (p: Product) => {
    const key = `produto:${p.id}`;
    if (hasItem(key)) removeItem(key);
    else addItem({ key, productId: p.id, name: p.name, source: 'catalogo', format: '' });
  };
}

/**
 * Alternância Peça ↔ Textura dirigida apenas por estado (sem :hover/:focus-within),
 * então botão e imagem nunca divergem. O estado vive no card (chaveado pelo id do produto).
 */
function ProductCard({ p, onExplore }: { p: Product; onExplore: (p: Product, el: HTMLElement) => void }) {
  const [view, setView] = useState<'studio' | 'macro'>('studio');
  // Pré-visualização por hover (mouse): nunca altera a escolha do usuário e some ao sair
  // ou ao passar sobre o controle Peça/Textura, então botão e imagem não divergem.
  const [preview, setPreview] = useState(false);
  const shown = view === 'studio' && preview && p.macro ? 'macro' : view;
  const { hasItem } = useConcierge();
  const toggle = useRequestToggle();
  const added = hasItem(`produto:${p.id}`);
  const cat = categories.find((c) => c.id === p.category)!;

  return (
    <article className={`pcard ${added ? 'is-added' : ''}`} data-view={shown} data-choice={view} aria-labelledby={`p-${p.id}`} data-testid="product-card">
      <div
        className="pcard__media"
        onPointerMove={(e) => {
          if (e.pointerType !== 'mouse') return;
          const overControls = Boolean((e.target as HTMLElement).closest('.pcard__views'));
          setPreview((cur) => (cur === !overControls ? cur : !overControls));
        }}
        onPointerLeave={() => setPreview(false)}
      >
        <div className="pcard__layer pcard__layer--studio" aria-hidden={shown !== 'studio'}>
          <Picture set={p.studio!} alt={`${p.name}, peça inteira sobre ardósia (imagem ilustrativa)`} sizes="(max-width: 599px) 92vw, (max-width: 1023px) 46vw, (max-width: 1399px) 31vw, 24vw" />
        </div>
        {p.macro && (
          <div className="pcard__layer pcard__layer--macro" aria-hidden={shown !== 'macro'}>
            <Picture set={p.macro} alt={`Textura aproximada de ${p.name} (imagem ilustrativa)`} sizes="(max-width: 599px) 92vw, (max-width: 1023px) 46vw, (max-width: 1399px) 31vw, 24vw" />
          </div>
        )}
        {added && (
          <span className="pcard__badge">
            <Check aria-hidden="true" /> Na solicitação
          </span>
        )}
        {p.macro && (
          <div className="segmented pcard__views" role="group" aria-label={`Enquadramento de ${p.name}`}>
            <button type="button" aria-pressed={view === 'studio'} onClick={() => { setView('studio'); setPreview(false); }} data-testid="view-studio">
              Peça
            </button>
            <button type="button" aria-pressed={view === 'macro'} onClick={() => { setView('macro'); setPreview(false); }} data-testid="view-macro">
              Textura
            </button>
          </div>
        )}
      </div>
      <div className="pcard__body">
        <p className="pcard__cat">{cat.label}</p>
        <h3 id={`p-${p.id}`} className="serif pcard__name">
          {p.name}
        </h3>
        <p className="pcard__tag">{p.tagline}</p>
        {p.needsConfirmation && <p className="note">Linha sujeita a confirmação.</p>}
        <div className="pcard__actions">
          <button type="button" className="btn btn--link" onClick={(e) => onExplore(p, e.currentTarget)}>
            <span>Explorar detalhes</span>
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm pcard__add"
            aria-pressed={added}
            onClick={() => toggle(p)}
            data-testid="product-add"
          >
            {added ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {added ? 'Selecionado' : 'Solicitar orçamento'}
            <span className="sr-only">: {p.name}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

/**
 * Progresso do carrossel por toque (só visível em telas estreitas, onde a grade vira faixa com snap).
 * A contagem textual acessível continua em "Exibindo X de Y"; este indicador é visual.
 */
function CarouselProgress({ gridRef, count, resetKey }: { gridRef: React.RefObject<HTMLDivElement>; count: number; resetKey: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const cell = el.querySelector<HTMLElement>('.catalog__cell');
      const step = cell ? cell.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '0') : el.clientWidth;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      setI(atEnd ? count - 1 : Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / Math.max(1, step)))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [gridRef, count, resetKey]);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="catalog__progress" aria-hidden="true" data-testid="catalog-progress">
      <span className="catalog__progress-count">
        <strong>{pad(i + 1)}</strong> / {pad(count)}
      </span>
      <span className="catalog__progress-bar">
        <span style={{ transform: `scaleX(${(i + 1) / Math.max(1, count)})` }} />
      </span>
      <span className="catalog__progress-hint">Deslize</span>
    </div>
  );
}

export function Catalog() {
  const root = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>('todos');
  const [expanded, setExpanded] = useState(false);
  const [spot, setSpot] = useState<Product | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  const full = useMemo(() => {
    if (filter !== 'todos') return products.filter((p) => p.category === filter);
    const curated = CURATED.map((id) => products.find((p) => p.id === id)!).filter(Boolean);
    return [...curated, ...products.filter((p) => !CURATED.includes(p.id))];
  }, [filter]);
  const list = expanded ? full : full.slice(0, INITIAL);
  const hidden = full.length - list.length;

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setExpanded(false);
    gridRef.current?.scrollTo({ left: 0 });
  };

  const filterItems: { id: Filter; label: string; count: number }[] = [
    { id: 'todos', label: 'Todos', count: products.length },
    ...categories.map((c) => ({ id: c.id as Filter, label: c.short, count: products.filter((p) => p.category === c.id).length })),
  ];

  return (
    <section id="produtos" ref={root} className="catalog section" aria-labelledby="catalog-title" tabIndex={-1}>
      <div className="container">
        <div className="catalog__head">
          <div>
            <p className="eyebrow">The Butcher’s Selection</p>
            <h2 id="catalog-title" className="serif h2">
              Cada corte tem <em>seu propósito.</em>
            </h2>
          </div>
          <p className="lead">
            Vitrine para cozinhas profissionais. Escolha os cortes, monte sua seleção e receba uma proposta da equipe. Sem preços públicos: cada operação tem sua medida.
          </p>
        </div>

        <div className="catalog__bar">
          <div className="catalog__filters" role="group" aria-label="Filtrar por categoria">
            {filterItems.map((f) => (
              <button key={f.id} type="button" className="filter has-indicator" aria-pressed={filter === f.id} onClick={() => changeFilter(f.id)}>
                {f.label}
                <span className="filter__count">{String(f.count).padStart(2, '0')}</span>
                {filter === f.id && (
                  <motion.span
                    layoutId="catalog-filter-indicator"
                    className="filter__indicator"
                    aria-hidden="true"
                    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 38 }}
                  />
                )}
              </button>
            ))}
          </div>
          <p className="catalog__status" aria-live="polite">
            Exibindo {list.length} de {full.length}
          </p>
        </div>

        <div ref={gridRef} className="catalog__grid">
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((p, i) => (
              <motion.div
                key={`${filter}-${p.id}`}
                className="catalog__cell"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.55, delay: reduce ? 0 : Math.min(i, 8) * 0.045, ease: [0.22, 1, 0.36, 1] } }}
                exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.16 } }}
              >
                <ProductCard
                  p={p}
                  onExplore={(prod, el) => {
                    returnFocus.current = el;
                    setSpot(prod);
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <CarouselProgress gridRef={gridRef} count={list.length} resetKey={`${filter}-${expanded}`} />

        <div className="catalog__foot">
          {full.length > INITIAL && (
            <button
              type="button"
              className="btn btn--ghost"
              aria-expanded={expanded}
              onClick={() => {
                if (expanded) {
                  setExpanded(false);
                  root.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
                } else {
                  setExpanded(true);
                  // leva o foco ao primeiro item revelado
                  requestAnimationFrame(() =>
                    gridRef.current?.querySelectorAll<HTMLElement>('.pcard__actions .btn--link')[INITIAL]?.focus({ preventScroll: true }),
                  );
                }
              }}
              data-testid="catalog-more"
            >
              {expanded ? 'Mostrar menos' : `Mostrar todos (+${hidden})`} <ArrowRight aria-hidden="true" />
            </button>
          )}
          <p className="note">Fotografias ilustrativas produzidas para esta demonstração, não registros de lotes reais. Disponibilidade e especificações sob consulta.</p>
        </div>
      </div>

      <ProductSpotlight
        product={spot}
        onClose={() => {
          setSpot(null);
          requestAnimationFrame(() => returnFocus.current?.focus());
        }}
      />
    </section>
  );
}
