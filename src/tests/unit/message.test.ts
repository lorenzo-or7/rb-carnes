import { describe, expect, it } from 'vitest';
import { buildMessage, buildWhatsAppUrl, clean } from '../../concierge/message';
import { emptyState, type ConciergeState } from '../../concierge/types';
import { formatBrPhone, isValidBrPhone, validateStep } from '../../concierge/validation';
import { config, getWhatsAppNumber, isValidE164 } from '../../data/config';
import { products } from '../../data/products';

const filled: ConciergeState = {
  ...emptyState,
  segment: 'hamburgueria',
  items: [
    { key: 'produto:acem-lombo', productId: 'acem-lombo', name: 'Acém', source: 'catalogo', format: 'Moída', quantity: '30 kg/semana', notes: 'Blend & <b>teste</b>' },
    { key: 'corte:cubos', productId: 'cortes-personalizados', name: 'Corte sob medida: Cubos', source: 'sob-medida', format: 'Cubos', quantity: '', notes: '' },
  ],
  specs: { periodicity: 'Semanal', portions: '150 g', notes: '' },
  contact: { name: 'Ana', business: 'Burger Lab', city: 'São José', whatsapp: '(48) 99999-0000' },
};

describe('buildMessage', () => {
  it('monta texto puro com todos os blocos', () => {
    const m = buildMessage(filled);
    expect(m).toContain('Operação: Hamburgueria');
    expect(m).toContain('1. Acém · formato: Moída · quantidade: 30 kg/semana');
    expect(m).toContain('2. Corte sob medida: Cubos');
    expect(m).toContain('Periodicidade: Semanal');
    expect(m).toContain('WhatsApp: (48) 99999-0000');
  });
  it('remove caracteres de controle e limita tamanho', () => {
    expect(clean('a\u0000b\u0007c')).toBe('abc');
    expect(clean('x'.repeat(1000)).length).toBe(400);
  });
  it('trata "Outro" com descrição livre', () => {
    const m = buildMessage({ ...filled, segment: 'outro', segmentOther: 'Buffet' });
    expect(m).toContain('Operação: Outro: Buffet');
  });
});

describe('WhatsApp', () => {
  it('não gera link sem número E.164 válido', () => {
    expect(buildWhatsAppUrl(null, 'oi')).toBeNull();
    expect(buildWhatsAppUrl('48999990000', 'oi')).toBeNull();
    expect(buildWhatsAppUrl('+55', 'oi')).toBeNull();
  });
  it('codifica o texto com encodeURIComponent', () => {
    const url = buildWhatsAppUrl('+5548999990000', 'Olá & até já\nok?');
    expect(url).toBe(`https://wa.me/5548999990000?text=${encodeURIComponent('Olá & até já\nok?')}`);
  });
  it('a configuração atual não expõe número não confirmado', () => {
    expect(config.WHATSAPP_SALES_E164.needsConfirmation).toBe(true);
    expect(getWhatsAppNumber()).toBeNull();
    expect(isValidE164('+5548999990000')).toBe(true);
  });
});

describe('validação', () => {
  it('telefone BR', () => {
    expect(isValidBrPhone('(48) 99999-0000')).toBe(true);
    expect(isValidBrPhone('+55 48 3333-0000')).toBe(true);
    expect(isValidBrPhone('123')).toBe(false);
    expect(isValidBrPhone('(48) 89999-0000')).toBe(false);
    expect(formatBrPhone('48999990000')).toBe('(48) 99999-0000');
  });
  it('etapas', () => {
    expect(validateStep(0, emptyState).segment).toBeTruthy();
    expect(validateStep(0, { ...emptyState, segment: 'outro' }).segmentOther).toBeTruthy();
    expect(validateStep(1, emptyState).items).toBeTruthy();
    expect(Object.keys(validateStep(2, emptyState))).toHaveLength(0);
    expect(Object.keys(validateStep(3, emptyState)).sort()).toEqual(['business', 'city', 'name', 'whatsapp']);
    expect(Object.keys(validateStep(3, filled))).toHaveLength(0);
  });
});

describe('dados', () => {
  it('produtos com id único e imagem ou composição tipográfica', () => {
    const ids = new Set(products.map((p) => p.id));
    expect(ids.size).toBe(products.length);
    products.forEach((p) => {
      expect(p.studio).toBeTruthy();
      expect(p.name).not.toMatch(/undefined|lorem/i);
    });
  });
});
