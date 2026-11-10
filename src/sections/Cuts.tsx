import { useLayoutEffect, useRef, useState } from 'react';
import { Scissors } from 'lucide-react';
import { ScrollTrigger } from '../app/gsap';
import { Picture } from '../components/Picture';
import { productById } from '../data/products';
import { useConcierge } from '../concierge/ConciergeContext';
import { useIsDesktop, useReducedMotion } from '../hooks/useMediaQuery';

/**
 * Cortes Sob Medida — transformação fotográfica.
 * O 3D procedural de blocos foi substituído: as fotografias reais dos formatos
 * (lote 2) dão realismo que a geometria em tempo real não alcançava.
 * Cada passo entra por um "corte": régua dourada atravessa o quadro e a nova
 * fotografia é revelada pela máscara que segue a lâmina; um quadro macro mostra a textura.
 */
const STEPS = [
  {
    id: 'peca', label: 'Peça inteira', title: 'Tudo começa na peça.',
    text: 'Uma peça inteira, selecionada para a sua operação. A partir dela, o corte segue a especificação da sua cozinha.',
    spec: [['Ponto de partida', 'peça selecionada'], ['Indicado para', 'quem porciona na casa']],
    product: 'contra-file', format: 'Peça inteira',
  },
  {
    id: 'bifes', label: 'Bifes', title: 'Bifes padronizados',
    text: 'Fatias de espessura uniforme para grelha, chapa e pratos executivos. Mesmo ponto, mesmo tempo de preparo.',
    spec: [['Espessura', 'definida pela sua ficha técnica'], ['Indicado para', 'grelha, chapa, executivos']],
    product: 'bifes-padronizados', format: 'Bifes',
  },
  {
    id: 'cubos', label: 'Cubos', title: 'Cubos regulares',
    text: 'Peças de tamanho regular que cozinham por igual. Prontas para ensopados, espetos e marmitas.',
    spec: [['Tamanho', 'sob especificação'], ['Indicado para', 'ensopados, espetos, marmitas']],
    product: 'cubos', format: 'Cubos',
  },
  {
    id: 'tiras', label: 'Tiras', title: 'Tiras e iscas',
    text: 'Cortes longos e finos, prontos para saltear, rechear ou finalizar em poucos minutos.',
    spec: [['Largura', 'sob especificação'], ['Indicado para', 'strogonoff, salteados, delivery']],
    product: 'tiras-iscas', format: 'Tiras',
  },
  {
    id: 'personalizado', label: 'Sob medida', title: 'Cortes personalizados',
    text: 'Gramaturas e formatos combinados com a equipe RB, a partir do que a sua operação realmente usa.',
    spec: [['Gramatura', 'combinada com a equipe'], ['Indicado para', 'fichas técnicas e redes']],
    product: 'cortes-personalizados', format: 'Personalizado',
  },
] as const;

export function Cuts() {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const desktop = useIsDesktop();
  const reduced = useReducedMotion();
  const scrub = desktop && !reduced;
  const { open } = useConcierge();

  const go = (n: number) => setStep(n);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !scrub) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const idx = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length * 0.999));
        go(idx);
      },
    });
    return () => st.kill();
  }, [scrub]);

  /** Desktop: as abas levam ao trecho correspondente do scroll (navegação natural preservada). */
  const choose = (i: number) => {
    const el = root.current;
    if (scrub && el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const range = el.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + range * ((i + 0.5) / STEPS.length), behavior: 'smooth' });
    }
    go(i);
  };

  const current = STEPS[step];

  return (
    <section id="sob-medida" ref={root} className={`cuts ${scrub ? 'cuts--scrub' : ''}`} aria-labelledby="cuts-title" tabIndex={-1}>
      <div className="cuts__stage">
        <div className="container cuts__layout">
          <div className="cuts__copy">
            <p className="eyebrow">Cortes sob medida</p>
            <h2 id="cuts-title" className="serif h2">
              Do seu jeito. <em>Na medida certa.</em>
            </h2>

            <div className="cuts__tabs" role="tablist" aria-label="Formatos de corte">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  id={`cut-tab-${s.id}`}
                  aria-selected={step === i}
                  aria-controls="cut-panel"
                  tabIndex={step === i ? 0 : -1}
                  className="cuts__tab"
                  onClick={() => choose(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + STEPS.length) % STEPS.length;
                      choose(n);
                      document.getElementById(`cut-tab-${STEPS[n].id}`)?.focus();
                    }
                  }}
                >
                  <span className="cuts__tabnum">0{i + 1}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            <div id="cut-panel" role="tabpanel" aria-labelledby={`cut-tab-${current.id}`} className="cuts__panel" key={current.id}>
              <h3 className="serif h3">{current.title}</h3>
              <p>{current.text}</p>
              <dl className="cuts__spec">
                {current.spec.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() =>
                  open({
                    step: 2,
                    item: {
                      key: `corte:${current.id}`,
                      productId: 'cortes-personalizados',
                      name: `Corte sob medida: ${current.label}`,
                      source: 'sob-medida',
                      format: current.format,
                    },
                  })
                }
              >
                <Scissors aria-hidden="true" />
                Solicitar corte personalizado
              </button>
            </div>
          </div>

          <div className="cuts__visual" data-step={step}>
            <div className="cuts__frame">
              {STEPS.map((s, i) => {
                const p = productById(s.product)!;
                return (
                  <figure key={s.id} className={`cuts__shot ${i === step ? 'is-active' : ''} ${i < step ? 'is-past' : ''}`} aria-hidden={i !== step}>
                    <Picture set={p.studio!} alt={`${s.title} (imagem ilustrativa)`} sizes="(max-width: 1023px) 92vw, 46vw" />
                  </figure>
                );
              })}
              {!reduced && <span key={step} className="cuts__blade" aria-hidden="true" />}
              <p className="cuts__caption" aria-hidden="true">
                <span>0{step + 1}</span> {current.label}
              </p>
            </div>
            <div className="cuts__macro" aria-hidden="true">
              {STEPS.map((s, i) => {
                const p = productById(s.product)!;
                return (
                  <div key={s.id} className={`cuts__macro-shot ${i === step ? 'is-active' : ''}`}>
                    {p.macro && <Picture set={p.macro} alt="" sizes="220px" />}
                  </div>
                );
              })}
              <span className="cuts__macro-label">Textura</span>
            </div>
            <ol className="cuts__progress" aria-hidden="true">
              {STEPS.map((s, i) => (
                <li key={s.id} className={i <= step ? 'is-on' : ''} />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
