import { LIMITS, type ConciergeState } from './types';

export type Errors = Partial<Record<string, string>>;

export function onlyDigits(s: string) {
  return s.replace(/\D/g, '');
}

/** Telefone BR: DDD + 8 ou 9 dígitos, com ou sem +55. */
export function isValidBrPhone(raw: string) {
  let d = onlyDigits(raw);
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (!(d.length === 10 || d.length === 11)) return false;
  if (d[0] === '0') return false;
  if (d.length === 11 && d[2] !== '9') return false;
  return true;
}

export function formatBrPhone(raw: string) {
  const d = onlyDigits(raw).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function validateStep(step: number, s: ConciergeState): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!s.segment) e.segment = 'Selecione o tipo de operação.';
    if (s.segment === 'outro' && !s.segmentOther.trim()) e.segmentOther = 'Conte qual é o tipo de operação.';
  }
  if (step === 1) {
    if (s.items.length === 0) e.items = 'Escolha ao menos um produto ou solução.';
    if (s.items.length > LIMITS.items) e.items = `Limite de ${LIMITS.items} itens por solicitação.`;
  }
  if (step === 2) {
    if (s.specs.notes.length > LIMITS.notes) e.specNotes = `Use até ${LIMITS.notes} caracteres.`;
    s.items.forEach((it) => {
      if (it.notes.length > LIMITS.notes) e[`item-${it.key}`] = `Use até ${LIMITS.notes} caracteres.`;
    });
  }
  if (step === 3) {
    const c = s.contact;
    if (!c.name.trim()) e.name = 'Informe seu nome.';
    else if (c.name.length > LIMITS.short) e.name = 'Nome muito longo.';
    if (!c.business.trim()) e.business = 'Informe o nome do estabelecimento.';
    else if (c.business.length > LIMITS.short) e.business = 'Nome muito longo.';
    if (!c.city.trim()) e.city = 'Informe a cidade.';
    else if (c.city.length > LIMITS.short) e.city = 'Nome muito longo.';
    if (!c.whatsapp.trim()) e.whatsapp = 'Informe um WhatsApp para retorno.';
    else if (!isValidBrPhone(c.whatsapp)) e.whatsapp = 'Use DDD + número, ex.: (48) 99999-0000.';
  }
  return e;
}
