import { segments } from '../data/solutions';
import { isValidE164 } from '../data/config';
import type { ConciergeState } from './types';

/** Remove caracteres de controle e limita tamanho. Texto puro, nunca HTML. */
export function clean(s: string, max = 400) {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max);
}

export function buildMessage(s: ConciergeState): string {
  const seg = segments.find((x) => x.id === s.segment);
  const segLabel = s.segment === 'outro' ? `Outro: ${clean(s.segmentOther, 80)}` : seg?.label ?? 'Não informado';
  const lines: string[] = [];
  lines.push('Olá, equipe RB Carnes! Gostaria de solicitar um orçamento.');
  lines.push('');
  lines.push(`Operação: ${segLabel}`);
  lines.push('');
  lines.push('Produtos e soluções:');
  s.items.forEach((it, i) => {
    const parts = [`${i + 1}. ${clean(it.name, 80)}`];
    if (it.format) parts.push(`formato: ${clean(it.format, 40)}`);
    if (it.quantity) parts.push(`quantidade: ${clean(it.quantity, 60)}`);
    lines.push(parts.join(' · '));
    if (it.notes) lines.push(`   Obs.: ${clean(it.notes)}`);
  });
  const sp = s.specs;
  if (sp.periodicity || sp.portions || sp.notes) {
    lines.push('');
    if (sp.periodicity) lines.push(`Periodicidade: ${clean(sp.periodicity, 40)}`);
    if (sp.portions) lines.push(`Porções: ${clean(sp.portions, 80)}`);
    if (sp.notes) lines.push(`Observações: ${clean(sp.notes)}`);
  }
  lines.push('');
  lines.push(`Nome: ${clean(s.contact.name, 80)}`);
  lines.push(`Estabelecimento: ${clean(s.contact.business, 80)}`);
  lines.push(`Cidade: ${clean(s.contact.city, 80)}`);
  lines.push(`WhatsApp: ${clean(s.contact.whatsapp, 30)}`);
  return lines.join('\n');
}

/** Monta o link do WhatsApp somente para número E.164 válido. */
export function buildWhatsAppUrl(e164: string | null, text: string): string | null {
  if (!isValidE164(e164)) return null;
  return `https://wa.me/${e164.replace('+', '')}?text=${encodeURIComponent(text)}`;
}
