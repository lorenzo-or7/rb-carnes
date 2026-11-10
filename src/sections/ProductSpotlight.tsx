import { useEffect, useRef, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { Picture } from '../components/Picture';
import { categories, type Product } from '../data/products';
import { useConcierge } from '../concierge/ConciergeContext';

/**
 * Product Spotlight — composição editorial em diálogo nativo (<dialog>):
 * foco preso, Escape, fundo inerte, e retorno do foco ao gatilho.
 */
export function ProductSpotlight({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<'studio' | 'macro'>('studio');
  const { hasItem, addItem, removeItem, open } = useConcierge();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (product && !d.open) {
      setView('studio');
      d.showModal();
      document.body.classList.add('is-locked');
    }
    if (!product && d.open) d.close();
  }, [product]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onCloseEv = () => {
      document.body.classList.remove('is-locked');
      onClose();
    };
    d.addEventListener('close', onCloseEv);
    return () => d.removeEventListener('close', onCloseEv);
  }, [onClose]);

  const p = product;
  const key = p ? `produto:${p.id}` : '';
  const added = p ? hasItem(key) : false;
  const cat = p ? categories.find((c) => c.id === p.category) : undefined;

  return (
    <dialog
      ref={ref}
      className="spot"
      aria-labelledby="spot-title"
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      data-testid="spotlight"
    >
      {p && (
        <div className="spot__inner">
          <div className="spot__media">
            {p.studio ? (
              <>
                <div className={`spot__img ${view === 'studio' ? 'is-on' : ''}`}>
                  <Picture set={p.studio} alt={`${p.name} sobre ardósia (imagem ilustrativa)`} sizes="(max-width: 899px) 100vw, 50vw" />
                </div>
                {p.macro && (
                  <div className={`spot__img ${view === 'macro' ? 'is-on' : ''}`}>
                    <Picture set={p.macro} alt={`Textura aproximada de ${p.name} (imagem ilustrativa)`} sizes="(max-width: 899px) 100vw, 50vw" />
                  </div>
                )}
                {p.macro && (
                  <div className="segmented spot__views" role="group" aria-label="Enquadramento">
                    <button type="button" aria-pressed={view === 'studio'} onClick={() => setView('studio')}>
                      Peça
                    </button>
                    <button type="button" aria-pressed={view === 'macro'} onClick={() => setView('macro')}>
                      Textura
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="spot__typeart" aria-hidden="true">
                <span className="serif">{p.name}</span>
              </div>
            )}
          </div>

          <div className="spot__body">
            <button type="button" className="icon-btn spot__close" onClick={() => ref.current?.close()} aria-label="Fechar detalhes">
              <X aria-hidden="true" />
            </button>
            <p className="eyebrow">{cat?.label}</p>
            <h2 id="spot-title" className="serif h2">
              {p.name}
            </h2>
            <p className="spot__tag serif">
              <em>{p.tagline}</em>
            </p>
            <p className="spot__desc">{p.description}</p>

            <dl className="spot__specs">
              <div>
                <dt>Sugestões de uso</dt>
                <dd>{p.uses.join(' · ')}</dd>
              </div>
              <div>
                <dt>Formatos</dt>
                <dd>{p.formats.join(' · ')}</dd>
              </div>
              <div>
                <dt>Disponibilidade</dt>
                <dd>Sob consulta com a equipe comercial</dd>
              </div>
            </dl>
            {p.illustrative && <p className="note">Imagem ilustrativa produzida para esta demonstração; não é fotografia de lote da RB.</p>}
            {p.note && <p className="note">{p.note}</p>}

            <div className="spot__actions">
              <button
                type="button"
                className={`btn ${added ? 'btn--ghost' : 'btn--primary'}`}
                aria-pressed={added}
                onClick={() =>
                  added ? removeItem(key) : addItem({ key, productId: p.id, name: p.name, source: 'catalogo', format: '' })
                }
              >
                {added ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
                {added ? 'Na solicitação' : 'Solicitar orçamento'}
              </button>
              <button
                type="button"
                className="btn btn--link"
                onClick={() => {
                  ref.current?.close();
                  open({ step: 1 });
                }}
              >
                <span>Ver minha seleção</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
