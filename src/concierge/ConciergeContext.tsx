import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SegmentId } from '../data/solutions';
import { LIMITS, emptyState, type ConciergeState, type Contact, type RequestItem, type Specs } from './types';

const KEY = 'rb-concierge-selection';

export interface OpenOptions {
  step?: number;
  segment?: SegmentId;
  item?: Omit<RequestItem, 'quantity' | 'notes'> & Partial<Pick<RequestItem, 'quantity' | 'notes'>>;
}

interface Ctx {
  state: ConciergeState;
  isOpen: boolean;
  step: number;
  setStep: (n: number) => void;
  open: (o?: OpenOptions) => void;
  close: () => void;
  setSegment: (s: SegmentId | null) => void;
  setSegmentOther: (v: string) => void;
  addItem: (i: OpenOptions['item']) => boolean;
  removeItem: (key: string) => void;
  updateItem: (key: string, patch: Partial<RequestItem>) => void;
  hasItem: (key: string) => boolean;
  setSpecs: (patch: Partial<Specs>) => void;
  setContact: (patch: Partial<Contact>) => void;
  reset: () => void;
  /** última mensagem curta para anunciar via aria-live */
  announcement: string;
}

const C = createContext<Ctx | null>(null);

/** Restaura somente seleção (sem dados pessoais) do sessionStorage. */
function restore(): ConciergeState {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return emptyState;
    const p = JSON.parse(raw) as Partial<ConciergeState>;
    return {
      ...emptyState,
      segment: p.segment ?? null,
      segmentOther: typeof p.segmentOther === 'string' ? p.segmentOther.slice(0, LIMITS.short) : '',
      items: Array.isArray(p.items) ? p.items.slice(0, LIMITS.items) : [],
      specs: { ...emptyState.specs, ...(p.specs ?? {}) },
    };
  } catch {
    return emptyState;
  }
}

export function ConciergeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConciergeState>(restore);
  const [isOpen, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const { segment, segmentOther, items, specs } = state;
      sessionStorage.setItem(KEY, JSON.stringify({ segment, segmentOther, items, specs }));
    } catch {
      /* indisponível */
    }
  }, [state]);

  const addItem = useCallback<Ctx['addItem']>((i) => {
    if (!i) return false;
    const exists = stateRef.current.items.some((x) => x.key === i.key);
    if (exists) {
      setAnnouncement(`${i.name} já está na sua seleção.`);
      return false;
    }
    if (stateRef.current.items.length >= LIMITS.items) {
      setAnnouncement(`Limite de ${LIMITS.items} itens atingido.`);
      return false;
    }
    setState((s) => ({ ...s, items: [...s.items, { quantity: '', notes: '', ...i }] }));
    setAnnouncement(`${i.name} adicionado à solicitação.`);
    return true;
  }, []);

  const removeItem = useCallback((key: string) => {
    const it = stateRef.current.items.find((x) => x.key === key);
    setState((s) => ({ ...s, items: s.items.filter((x) => x.key !== key) }));
    if (it) setAnnouncement(`${it.name} removido da solicitação.`);
  }, []);

  const open = useCallback<Ctx['open']>(
    (o = {}) => {
      if (o.segment) setState((s) => ({ ...s, segment: o.segment! }));
      if (o.item) addItem(o.item);
      setStep(o.step ?? (o.segment && !o.item ? 1 : 0));
      setOpen(true);
    },
    [addItem],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      isOpen,
      step,
      setStep,
      open,
      close: () => setOpen(false),
      setSegment: (segment) => setState((s) => ({ ...s, segment })),
      setSegmentOther: (v) => setState((s) => ({ ...s, segmentOther: v.slice(0, LIMITS.short) })),
      addItem,
      removeItem,
      updateItem: (key, patch) =>
        setState((s) => ({ ...s, items: s.items.map((x) => (x.key === key ? { ...x, ...patch } : x)) })),
      hasItem: (key) => state.items.some((x) => x.key === key),
      setSpecs: (patch) => setState((s) => ({ ...s, specs: { ...s.specs, ...patch } })),
      setContact: (patch) => setState((s) => ({ ...s, contact: { ...s.contact, ...patch } })),
      reset: () => {
        setState(emptyState);
        setStep(0);
        try {
          sessionStorage.removeItem(KEY);
        } catch {
          /* */
        }
      },
      announcement,
    }),
    [state, isOpen, step, open, addItem, removeItem, announcement],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useConcierge() {
  const c = useContext(C);
  if (!c) throw new Error('useConcierge fora do ConciergeProvider');
  return c;
}
