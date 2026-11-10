import type { SegmentId } from '../data/solutions';

export type ItemSource = 'catalogo' | 'sob-medida' | 'solucao' | 'concierge';

export interface RequestItem {
  /** chave de deduplicação: id do produto (+ formato quando sob medida) */
  key: string;
  productId: string;
  name: string;
  source: ItemSource;
  format: string;
  quantity: string;
  notes: string;
}

export interface Specs {
  periodicity: string;
  portions: string;
  notes: string;
}

export interface Contact {
  name: string;
  business: string;
  city: string;
  whatsapp: string;
}

export interface ConciergeState {
  segment: SegmentId | null;
  segmentOther: string;
  items: RequestItem[];
  specs: Specs;
  contact: Contact;
}

export const emptyState: ConciergeState = {
  segment: null,
  segmentOther: '',
  items: [],
  specs: { periodicity: '', portions: '', notes: '' },
  contact: { name: '', business: '', city: '', whatsapp: '' },
};

export const LIMITS = {
  short: 80,
  quantity: 60,
  notes: 400,
  items: 30,
} as const;

export const FORMAT_OPTIONS = ['Peça inteira', 'Bifes', 'Cubos', 'Tiras', 'Moída', 'Personalizado', 'A definir'];
export const PERIODICITY_OPTIONS = ['Pontual', 'Semanal', 'Quinzenal', 'Mensal', 'A definir'];
