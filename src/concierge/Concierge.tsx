import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Copy, MessageCircle, Pencil, Trash2, X } from 'lucide-react';
import { useConcierge } from './ConciergeContext';
import { categories, products } from '../data/products';
import { segments } from '../data/solutions';
import { getWhatsAppNumber } from '../data/config';
import { buildMessage, buildWhatsAppUrl } from './message';
import { formatBrPhone, validateStep, type Errors } from './validation';
import { FORMAT_OPTIONS, LIMITS, PERIODICITY_OPTIONS } from './types';

const STEPS = ['Operação', 'Produtos', 'Especificações', 'Contato e revisão'];

/* ---------- Campos tematizados ---------- */
function Field({ id, label, error, hint, children, optional }: { id: string; label: string; error?: string; hint?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id} className="field__label">
        {label} {optional && <span className="field__opt">opcional</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

function Select({ id, value, onChange, options, placeholder }: { id: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) {
  return (
    <div className="select">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ---------- Etapas ---------- */
function StepOperation({ errors }: { errors: Errors }) {
  const { state, setSegment, setSegmentOther } = useConcierge();
  return (
    <fieldset className="cstep" aria-describedby={errors.segment ? 'segment-error' : undefined}>
      <legend className="serif h3">Qual é o tipo da sua operação?</legend>
      <p className="muted">Isso ajuda a equipe a sugerir cortes e formatos adequados.</p>
      <div className="optgrid">
        {segments.map((s) => (
          <label key={s.id} className={`opt ${state.segment === s.id ? 'is-on' : ''}`}>
            <input type="radio" name="segment" value={s.id} checked={state.segment === s.id} onChange={() => setSegment(s.id)} />
            <span className="opt__mark" aria-hidden="true" />
            <span className="opt__label">{s.label}</span>
          </label>
        ))}
      </div>
      {errors.segment && (
        <p className="field__error" id="segment-error" role="alert">
          {errors.segment}
        </p>
      )}
      {state.segment === 'outro' && (
        <Field id="segment-other" label="Qual?" error={errors.segmentOther}>
          <input
            id="segment-other"
            className="input"
            value={state.segmentOther}
            maxLength={LIMITS.short}
            onChange={(e) => setSegmentOther(e.target.value)}
            aria-invalid={Boolean(errors.segmentOther)}
            aria-describedby={describedBy('segment-other', errors.segmentOther)}
            placeholder="Ex.: buffet, cozinha industrial"
          />
        </Field>
      )}
    </fieldset>
  );
}

function StepProducts({ errors }: { errors: Errors }) {
  const { state, addItem, removeItem } = useConcierge();
  const extras = state.items.filter((i) => !i.key.startsWith('produto:'));
  return (
    <div className="cstep">
      <h3 className="serif h3" id="products-legend">
        Quais produtos ou soluções interessam?
      </h3>
      <p className="muted">Itens escolhidos no catálogo já aparecem marcados. Selecione quantos quiser.</p>
      {errors.items && (
        <p className="field__error" role="alert" id="items-error">
          {errors.items}
        </p>
      )}
      {extras.length > 0 && (
        <div className="pickgroup">
          <p className="pickgroup__title">Cortes sob medida escolhidos</p>
          <ul role="list" className="extras">
            {extras.map((it) => (
              <li key={it.key}>
                <span>{it.name}</span>
                <button type="button" className="icon-btn icon-btn--sm" onClick={() => removeItem(it.key)} aria-label={`Remover ${it.name}`}>
                  <Trash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {categories.map((c) => (
        <fieldset key={c.id} className="pickgroup" aria-describedby={errors.items ? 'items-error' : undefined}>
          <legend className="pickgroup__title">{c.label}</legend>
          <div className="picklist">
            {products
              .filter((p) => p.category === c.id)
              .map((p) => {
                const key = `produto:${p.id}`;
                const on = state.items.some((i) => i.key === key);
                return (
                  <label key={p.id} className={`check ${on ? 'is-on' : ''}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => (on ? removeItem(key) : addItem({ key, productId: p.id, name: p.name, source: 'concierge', format: '' }))}
                    />
                    <span className="check__box" aria-hidden="true">
                      <Check />
                    </span>
                    <span>{p.name}</span>
                  </label>
                );
              })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function StepSpecs({ errors }: { errors: Errors }) {
  const { state, updateItem, removeItem, setSpecs } = useConcierge();
  return (
    <div className="cstep">
      <h3 className="serif h3">Especificações</h3>
      <p className="muted">Tudo opcional. Preencha o que já souber; a equipe completa com você.</p>
      <ul role="list" className="specitems">
        {state.items.map((it) => (
          <li key={it.key} className="specitem">
            <div className="specitem__head">
              <p className="specitem__name">{it.name}</p>
              <button type="button" className="icon-btn icon-btn--sm" onClick={() => removeItem(it.key)} aria-label={`Remover ${it.name}`}>
                <Trash2 aria-hidden="true" />
              </button>
            </div>
            <div className="specitem__grid">
              <Field id={`fmt-${it.key}`} label="Formato" optional>
                <Select id={`fmt-${it.key}`} value={it.format} onChange={(v) => updateItem(it.key, { format: v })} options={FORMAT_OPTIONS.includes(it.format) || !it.format ? FORMAT_OPTIONS : [it.format, ...FORMAT_OPTIONS]} placeholder="Selecione" />
              </Field>
              <Field id={`qty-${it.key}`} label="Quantidade aproximada" optional>
                <input
                  id={`qty-${it.key}`}
                  className="input"
                  value={it.quantity}
                  maxLength={LIMITS.quantity}
                  onChange={(e) => updateItem(it.key, { quantity: e.target.value })}
                  placeholder="Ex.: 20 kg por semana"
                />
              </Field>
            </div>
            <Field id={`obs-${it.key}`} label="Observações do item" optional error={errors[`item-${it.key}`]}>
              <textarea
                id={`obs-${it.key}`}
                className="input input--area"
                rows={2}
                value={it.notes}
                maxLength={LIMITS.notes}
                onChange={(e) => updateItem(it.key, { notes: e.target.value })}
                placeholder="Espessura, gramatura, embalagem…"
              />
            </Field>
          </li>
        ))}
      </ul>
      <div className="specglobal">
        <Field id="periodicity" label="Periodicidade" optional>
          <Select id="periodicity" value={state.specs.periodicity} onChange={(v) => setSpecs({ periodicity: v })} options={PERIODICITY_OPTIONS} placeholder="Selecione" />
        </Field>
        <Field id="portions" label="Porções" optional hint="Ex.: bifes de 150 g">
          <input
            id="portions"
            className="input"
            value={state.specs.portions}
            maxLength={LIMITS.short}
            onChange={(e) => setSpecs({ portions: e.target.value })}
            aria-describedby="portions-hint"
          />
        </Field>
      </div>
      <Field id="spec-notes" label="Observações gerais" optional error={errors.specNotes} hint={`${state.specs.notes.length}/${LIMITS.notes}`}>
        <textarea
          id="spec-notes"
          className="input input--area"
          rows={3}
          value={state.specs.notes}
          maxLength={LIMITS.notes}
          onChange={(e) => setSpecs({ notes: e.target.value })}
          aria-describedby={describedBy('spec-notes', errors.specNotes, 'x')}
        />
      </Field>
    </div>
  );
}

function StepContact({ errors, goTo }: { errors: Errors; goTo: (n: number) => void }) {
  const { state, setContact } = useConcierge();
  const c = state.contact;
  const seg = segments.find((s) => s.id === state.segment);
  const input = (id: keyof typeof c, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field id={`c-${id}`} label={label} error={errors[id]}>
      <input
        id={`c-${id}`}
        className="input"
        value={c[id]}
        maxLength={id === 'whatsapp' ? 16 : LIMITS.short}
        onChange={(e) => setContact({ [id]: id === 'whatsapp' ? formatBrPhone(e.target.value) : e.target.value })}
        aria-invalid={Boolean(errors[id])}
        aria-describedby={describedBy(`c-${id}`, errors[id])}
        aria-required="true"
        {...props}
      />
    </Field>
  );
  return (
    <div className="cstep">
      <h3 className="serif h3">Contato e revisão</h3>
      <div className="contactgrid">
        {input('name', 'Seu nome', { autoComplete: 'name' })}
        {input('business', 'Estabelecimento', { autoComplete: 'organization' })}
        {input('city', 'Cidade', { autoComplete: 'address-level2' })}
        {input('whatsapp', 'WhatsApp para retorno', { autoComplete: 'tel-national', inputMode: 'tel', placeholder: '(48) 99999-0000' })}
      </div>
      <p className="note">Seus dados ficam só nesta página, para montar a mensagem. Não são gravados nem enviados automaticamente.</p>

      <div className="review" aria-label="Resumo da solicitação">
        <div className="review__row">
          <div>
            <p className="review__k">Operação</p>
            <p>{state.segment === 'outro' ? `Outro: ${state.segmentOther}` : seg?.label ?? '—'}</p>
          </div>
          <button type="button" className="btn btn--link review__edit" onClick={() => goTo(0)}>
            <Pencil aria-hidden="true" /> <span>Editar operação</span>
          </button>
        </div>
        <div className="review__row">
          <div>
            <p className="review__k">Itens ({state.items.length})</p>
            <ul role="list" className="review__items">
              {state.items.map((i) => (
                <li key={i.key}>
                  {i.name}
                  {(i.format || i.quantity) && <span className="muted"> · {[i.format, i.quantity].filter(Boolean).join(' · ')}</span>}
                </li>
              ))}
            </ul>
          </div>
          <button type="button" className="btn btn--link review__edit" onClick={() => goTo(1)}>
            <Pencil aria-hidden="true" /> <span>Editar itens</span>
          </button>
        </div>
        <div className="review__row">
          <div>
            <p className="review__k">Especificações</p>
            <p>{[state.specs.periodicity, state.specs.portions].filter(Boolean).join(' · ') || 'A combinar com a equipe'}</p>
          </div>
          <button type="button" className="btn btn--link review__edit" onClick={() => goTo(2)}>
            <Pencil aria-hidden="true" /> <span>Editar especificações</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Concierge ---------- */
export function Concierge() {
  const ctx = useConcierge();
  const { isOpen, close, step, setStep, state, announcement, reset } = ctx;
  const ref = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [dir, setDir] = useState(1);
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [preview, setPreview] = useState(false);
  const reduce = useReducedMotion();
  const titleId = useId();
  const wa = getWhatsAppNumber();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) {
      opener.current = document.activeElement;
      d.showModal();
      document.body.classList.add('is-locked');
      setErrors({});
      setCopyState('idle');
    }
    if (!isOpen && d.open) d.close();
  }, [isOpen]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => {
      document.body.classList.remove('is-locked');
      close();
      const o = opener.current as HTMLElement | null;
      if (o && document.contains(o)) requestAnimationFrame(() => o.focus());
    };
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, [close]);

  // Ao trocar de etapa: topo do conteúdo e foco no título da etapa.
  useEffect(() => {
    if (!isOpen) return;
    bodyRef.current?.scrollTo({ top: 0 });
    requestAnimationFrame(() => {
      const h = bodyRef.current?.querySelector<HTMLElement>('.cstep h3, .cstep legend');
      if (h) {
        h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
      }
    });
  }, [step, isOpen]);

  const currentErrors = validateStep(step, state);
  const valid = Object.keys(currentErrors).length === 0;

  const goTo = (n: number) => {
    setDir(n > step ? 1 : -1);
    setErrors({});
    setStep(n);
  };
  const next = () => {
    if (!valid) {
      setErrors(currentErrors);
      requestAnimationFrame(() => {
        const first = bodyRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], .field__error');
        if (first?.matches('input, textarea, select')) first.focus();
        else bodyRef.current?.querySelector<HTMLElement>('input')?.focus();
      });
      return;
    }
    goTo(step + 1);
  };

  const message = buildMessage(state);
  const waUrl = buildWhatsAppUrl(wa, message);

  const copy = async () => {
    const all = [0, 1, 2, 3].reduce<Errors>((acc, s) => ({ ...acc, ...validateStep(s, state) }), {});
    if (Object.keys(all).length) {
      setErrors(validateStep(3, state));
      const firstBad = [0, 1, 2, 3].find((s) => Object.keys(validateStep(s, state)).length);
      if (firstBad !== undefined && firstBad !== 3) goTo(firstBad);
      return;
    }
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(message);
      else throw new Error('clipboard indisponível');
      setCopyState('ok');
    } catch {
      // Fallback: seleção manual.
      const ta = document.createElement('textarea');
      ta.value = message;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ref.current?.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      ta.remove();
      setCopyState(ok ? 'ok' : 'fail');
      if (!ok) setPreview(true);
    }
  };

  const variants = {
    // Entrada um pouco mais longa que a saída: a etapa nova chega com calma, a anterior sai rápido.
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 24 }),
    center: { opacity: 1, x: 0, transition: { duration: reduce ? 0.01 : 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -14, transition: { duration: reduce ? 0.01 : 0.18, ease: [0.4, 0, 1, 1] } }),
  };

  return (
    <dialog
      ref={ref}
      className="concierge"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      data-testid="concierge"
    >
      <div className="concierge__panel">
        <header className="concierge__head">
          <div>
            <p className="eyebrow eyebrow--plain">RB Concierge</p>
            <h2 id={titleId} className="serif concierge__title">
              Seu negócio. <em>Nossa solução.</em>
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={() => ref.current?.close()} aria-label="Fechar solicitação">
            <X aria-hidden="true" />
          </button>
        </header>

        {/* Stepper — adaptado do conceito React Bits Stepper */}
        <ol className="stepper" aria-label="Etapas">
          {STEPS.map((s, i) => {
            const status = i < step ? 'done' : i === step ? 'current' : 'todo';
            return (
              <li key={s} className={`stepper__item is-${status}`}>
                <button
                  type="button"
                  className="stepper__btn"
                  disabled={i > step}
                  onClick={() => goTo(i)}
                  aria-current={i === step ? 'step' : undefined}
                  aria-label={`Etapa ${i + 1} de ${STEPS.length}: ${s}${status === 'done' ? ' (concluída)' : ''}`}
                >
                  <span className="stepper__dot">{status === 'done' ? <Check aria-hidden="true" /> : i + 1}</span>
                  <span className="stepper__label">{s}</span>
                </button>
                {i < STEPS.length - 1 && <span className="stepper__line" aria-hidden="true" />}
              </li>
            );
          })}
        </ol>

        <div
          ref={bodyRef}
          className="concierge__body"
          onFocus={(e) => {
            // Toque: com o teclado virtual aberto, mantém o campo focado visível acima do rodapé do painel.
            const t = e.target as HTMLElement;
            if (!t.matches('input:not([type=radio]):not([type=checkbox]), textarea, select')) return;
            if (!window.matchMedia('(pointer: coarse)').matches) return;
            window.setTimeout(() => t.scrollIntoView({ block: 'center', behavior: 'smooth' }), 320);
          }}
        >
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduce ? 0.01 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && <StepOperation errors={errors} />}
              {step === 1 && <StepProducts errors={errors} />}
              {step === 2 && <StepSpecs errors={errors} />}
              {step === 3 && <StepContact errors={errors} goTo={goTo} />}
            </motion.div>
          </AnimatePresence>

          {step === 3 && (
            <div className="concierge__send">
              <div className="concierge__sendbtns">
                <button type="button" className="btn btn--gold" onClick={copy} data-testid="copy-request">
                  {copyState === 'ok' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copyState === 'ok' ? 'Solicitação copiada' : 'Copiar solicitação'}
                </button>
                {waUrl && valid ? (
                  <a className="btn btn--primary" href={waUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle aria-hidden="true" /> Enviar pelo WhatsApp
                  </a>
                ) : (
                  <button type="button" className="btn" aria-disabled="true" aria-describedby="wa-why" onClick={(e) => e.preventDefault()} data-testid="wa-disabled">
                    <MessageCircle aria-hidden="true" /> Enviar pelo WhatsApp
                  </button>
                )}
              </div>
              <p className="note" id="wa-why">
                {wa
                  ? 'O WhatsApp abre só quando você clicar, com a mensagem pronta para revisar.'
                  : 'Envio direto indisponível nesta demonstração: o WhatsApp comercial oficial ainda não foi configurado. Copie a solicitação para enviar pelo canal da equipe.'}
              </p>
              <button type="button" className="btn btn--link" onClick={() => setPreview((p) => !p)} aria-expanded={preview}>
                <span>{preview ? 'Ocultar mensagem' : 'Ver mensagem completa'}</span>
              </button>
              {preview && (
                <pre className="concierge__preview" data-testid="message-preview" tabIndex={0}>
                  {message}
                </pre>
              )}
              {copyState === 'ok' && (
                <button
                  type="button"
                  className="btn btn--link"
                  onClick={() => {
                    reset();
                    ctx.setContact({ name: '', business: '', city: '', whatsapp: '' });
                    setCopyState('idle');
                    setPreview(false);
                  }}
                >
                  <span>Limpar dados e começar outra solicitação</span>
                </button>
              )}
            </div>
          )}
        </div>

        <footer className="concierge__foot">
          <button type="button" className="btn btn--ghost" onClick={() => goTo(step - 1)} disabled={step === 0}>
            <ArrowLeft aria-hidden="true" /> Voltar
          </button>
          <p className="concierge__count" aria-hidden="true">
            {step + 1} / {STEPS.length}
          </p>
          {step < STEPS.length - 1 ? (
            <button type="button" className={`btn btn--primary ${valid ? '' : 'is-pending'}`} onClick={next} aria-describedby={valid ? undefined : 'next-why'} data-testid="concierge-next">
              Avançar <ArrowRight aria-hidden="true" />
            </button>
          ) : (
            <span />
          )}
        </footer>
        {!valid && step < 3 && (
          <p id="next-why" className="sr-only">
            Complete esta etapa para avançar.
          </p>
        )}
        <p className="sr-only" aria-live="polite">
          {announcement}
          {copyState === 'ok' ? ' Solicitação copiada para a área de transferência.' : ''}
          {copyState === 'fail' ? ' Não foi possível copiar automaticamente. A mensagem está visível para seleção manual.' : ''}
        </p>
      </div>
    </dialog>
  );
}
