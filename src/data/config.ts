/**
 * Configuração comercial central.
 *
 * Todo campo com `needsConfirmation: true` NÃO é exibido como fato no site.
 * Para ativar, preencha `value`, confirme com a RB Carnes e troque para `false`.
 */
export interface ConfigField<T> {
  value: T | null;
  needsConfirmation: boolean;
  note: string;
}

export interface SiteConfig {
  /** Número comercial oficial em E.164 (ex.: +5548999999999). */
  WHATSAPP_SALES_E164: ConfigField<string>;
  email: ConfigField<string>;
  businessHours: ConfigField<string>;
  mapUrl: ConfigField<string>;
  instagramUrl: ConfigField<string>;
  serviceArea: ConfigField<string>;
  orderCutoff: ConfigField<string>;
  /** URL do portfólio Or7 para linkar a assinatura (somente se confirmada). */
  or7PortfolioUrl: ConfigField<string>;
  /** Caminho da arte original da assinatura Or7 em /public. */
  or7SignatureSrc: ConfigField<string>;
  isDemo: boolean;
}

export const config: SiteConfig = {
  WHATSAPP_SALES_E164: {
    value: null,
    needsConfirmation: true,
    note: 'Número comercial oficial ainda não confirmado. Nenhum número de pesquisa foi usado.',
  },
  email: { value: null, needsConfirmation: true, note: 'E-mail comercial não confirmado.' },
  businessHours: { value: null, needsConfirmation: true, note: 'Horário de atendimento não confirmado.' },
  mapUrl: {
    value: 'https://www.google.com/maps/search/?api=1&query=Rua+Leopoldina+Marcelino+2000+Forquilhinhas+S%C3%A3o+Jos%C3%A9+SC',
    needsConfirmation: true,
    note: 'Endereço vem de dados cadastrais pesquisados; confirmar com a RB antes de ativar o mapa.',
  },
  instagramUrl: { value: null, needsConfirmation: true, note: 'Perfil oficial não confirmado.' },
  serviceArea: {
    value: 'Grande Florianópolis',
    needsConfirmation: true,
    note: 'Área divulgada pela própria RB em comunicações; confirmar cobertura atual.',
  },
  orderCutoff: {
    value: 'Pedidos até 14h, entrega no próximo dia útil',
    needsConfirmation: true,
    note: 'Divulgado pela RB; não é garantia comercial verificada. Não exibir até confirmação.',
  },
  or7PortfolioUrl: { value: null, needsConfirmation: true, note: 'URL do portfólio Or7 não confirmada.' },
  or7SignatureSrc: {
    value: '/assets/brand/or7-assinatura-800.webp',
    needsConfirmation: false,
    note: 'Arte original enviada pelo autor (fundo transparente), exibida sem alteração sobre placa preta.',
  },
  isDemo: true,
};

/** Retorna o valor somente quando confirmado. */
export function confirmed<T>(field: ConfigField<T>): T | null {
  return field.needsConfirmation ? null : field.value;
}

const E164 = /^\+[1-9]\d{7,14}$/;
export function isValidE164(n: string | null | undefined): n is string {
  return typeof n === 'string' && E164.test(n);
}

export function getWhatsAppNumber(): string | null {
  const n = confirmed(config.WHATSAPP_SALES_E164);
  return isValidE164(n) ? n : null;
}
