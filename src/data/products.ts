import manifest from './image-manifest.json';

export type CategoryId = 'bovinos' | 'suinos' | 'sob-medida' | 'moida' | 'complementares';

export interface Category {
  id: CategoryId;
  label: string;
  short: string;
}

export const categories: Category[] = [
  { id: 'bovinos', label: 'Cortes bovinos', short: 'Bovinos' },
  { id: 'suinos', label: 'Cortes suínos', short: 'Suínos' },
  { id: 'sob-medida', label: 'Padronizados e sob medida', short: 'Sob medida' },
  { id: 'moida', label: 'Carne moída', short: 'Moída' },
  { id: 'complementares', label: 'Complementares · Ekma', short: 'Complementares' },
];

export interface ImageSet {
  /** base sem sufixo, ex.: /rb-carnes/assets/products/entrecote-studio */
  base: string;
  w: number;
  h: number;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  /** Linha editorial curta. */
  tagline: string;
  description: string;
  uses: string[];
  formats: string[];
  studio?: ImageSet;
  macro?: ImageSet;
  /** Imagem ilustrativa (gerada/produzida para a demo), não registro real da RB. */
  illustrative: boolean;
  /** Item ou linha divulgada pela RB mas pendente de confirmação. */
  needsConfirmation?: boolean;
  note?: string;
}

type ManifestEntry = { studio?: { w: number; h: number }; macro?: { w: number; h: number } };
const m = manifest as unknown as Record<string, ManifestEntry>;
export const sceneManifest = (manifest as unknown as { __scenes: Record<string, { w: number; h: number }> }).__scenes;
function img(slug: string, kind: 'studio' | 'macro'): ImageSet | undefined {
  const e = m[slug]?.[kind];
  return e ? { base: `/rb-carnes/assets/products/${slug}-${kind}`, w: e.w, h: e.h } : undefined;
}
function photo(slug: string) {
  return { studio: img(slug, 'studio'), macro: img(slug, 'macro'), illustrative: true };
}

const STD_FORMATS = ['Peça inteira', 'Bifes', 'Cubos', 'Tiras', 'Sob especificação'];

export const products: Product[] = [
  {
    id: 'entrecote', name: 'Entrecôte', category: 'bovinos', ...photo('entrecote'),
    tagline: 'Marmoreio e presença no prato.',
    description: 'Corte macio, com gordura entremeada que garante suculência. Pede grelha e cozinha atenta ao ponto.',
    uses: ['Grelha e chapa', 'Pratos executivos', 'Cortes para porcionar'], formats: STD_FORMATS,
  },
  {
    id: 'contra-file', name: 'Contra-filé', category: 'bovinos', ...photo('contra-file'),
    tagline: 'O clássico que sustenta o cardápio.',
    description: 'Versátil e consistente, com capa de gordura que protege a carne no preparo.',
    uses: ['Bifes padronizados', 'Grelhados', 'Pratos do dia'], formats: STD_FORMATS,
  },
  {
    id: 'contra-file-cbc', name: 'Contra-filé CBC', category: 'bovinos', ...photo('contra-file-cbc'),
    tagline: 'Peça para quem porciona na casa.',
    description: 'Apresentação da peça conforme especificação comercial da RB. Consulte a equipe para detalhes do corte.',
    uses: ['Porcionamento próprio', 'Grelha'], formats: STD_FORMATS,
    note: 'Nomenclatura "CBC" mantida conforme arquivo recebido; confirmar descrição com a RB.',
  },
  {
    id: 'capa-contra-file', name: 'Capa de contra-filé', category: 'bovinos', ...photo('capa-contra-file'),
    tagline: 'Sabor intenso, cozimento lento.',
    description: 'Corte com fibras marcadas e cobertura de gordura, ideal para preparos longos.',
    uses: ['Assados', 'Cozidos', 'Desfiados'], formats: ['Peça inteira', 'Cubos', 'Sob especificação'],
  },
  {
    id: 'alcatra-completa', name: 'Alcatra completa', category: 'bovinos', ...photo('alcatra-completa'),
    tagline: 'Uma peça, vários cortes.',
    description: 'Peça inteira que reúne miolo, maminha e picanha, para operações que aproveitam cada parte.',
    uses: ['Porcionamento próprio', 'Bifes', 'Assados'], formats: ['Peça inteira', 'Sob especificação'],
  },
  {
    id: 'alcatra-miolo', name: 'Miolo da alcatra', category: 'bovinos', ...photo('alcatra-miolo'),
    tagline: 'Rendimento alto, pouca perda.',
    description: 'Parte central da alcatra, magra e uniforme. Rende bifes regulares e cubos bem definidos.',
    uses: ['Bifes padronizados', 'Espetos', 'Iscas'], formats: STD_FORMATS,
  },
  {
    id: 'fraldinha', name: 'Fraldinha', category: 'bovinos', ...photo('fraldinha'),
    tagline: 'Fibras longas, sabor marcante.',
    description: 'Corte suculento, de fibras aparentes, que vai bem tanto na grelha quanto em tiras.',
    uses: ['Grelha', 'Tiras para saltear', 'Sanduíches'], formats: ['Peça inteira', 'Tiras', 'Sob especificação'],
  },
  {
    id: 'fraldinha-miolo', name: 'Miolo da fraldinha', category: 'bovinos', ...photo('fraldinha-miolo'),
    tagline: 'A parte mais uniforme da fraldinha.',
    description: 'Peça limpa e regular, pensada para cozinhas que precisam de corte rápido e previsível.',
    uses: ['Tiras', 'Grelha', 'Pratos executivos'], formats: ['Peça inteira', 'Tiras', 'Bifes'],
  },
  {
    id: 'coxao-mole', name: 'Coxão mole', category: 'bovinos', ...photo('coxao-mole'),
    tagline: 'A base de muitas cozinhas.',
    description: 'Carne magra e macia, muito usada em bifes, à milanesa e preparos do dia a dia.',
    uses: ['Bifes', 'Milanesa', 'Iscas e strogonoff'], formats: STD_FORMATS,
  },
  {
    id: 'capa-coxao-mole', name: 'Capa de coxão mole', category: 'bovinos', ...photo('capa-coxao-mole'),
    tagline: 'Para cozimentos com sabor.',
    description: 'Camada externa do coxão mole, com fibras firmes, indicada para preparos úmidos.',
    uses: ['Cozidos', 'Ensopados', 'Desfiados'], formats: ['Peça inteira', 'Cubos'],
  },
  {
    id: 'coxao-duro', name: 'Coxão duro', category: 'bovinos', ...photo('coxao-duro'),
    tagline: 'Firmeza para panela.',
    description: 'Corte de fibras densas, que ganha maciez em cozimento lento.',
    uses: ['Carne de panela', 'Assados', 'Moída'], formats: ['Peça inteira', 'Cubos', 'Moída'],
    note: 'Duas fotos em close-up recebidas; não há enquadramento de estúdio para este corte.',
  },
  {
    id: 'acem-lombo', name: 'Acém', category: 'bovinos', ...photo('acem-lombo'),
    tagline: 'Sabor e custo sob controle.',
    description: 'Corte dianteiro de boa suculência, muito usado em moídas, cozidos e hambúrgueres.',
    uses: ['Hambúrguer', 'Moída', 'Cozidos'], formats: ['Peça inteira', 'Cubos', 'Moída'],
  },
  {
    id: 'costela', name: 'Costela', category: 'bovinos', ...photo('costela'),
    tagline: 'Tempo e fogo baixo.',
    description: 'Peça de gordura entremeada, feita para cocção longa.',
    uses: ['Assados lentos', 'Desfiados', 'Caldos'], formats: ['Peça inteira', 'Sob especificação'],
  },
  {
    id: 'cupim', name: 'Cupim', category: 'bovinos', ...photo('cupim'),
    tagline: 'Gordura que vira maciez.',
    description: 'Corte marmorizado que, em cozimento demorado, fica macio e desfia com facilidade.',
    uses: ['Assados', 'Desfiados', 'Sanduíches'], formats: ['Peça inteira', 'Sob especificação'],
  },
  {
    id: 'paleta-suina', name: 'Paleta suína', category: 'suinos', ...photo('paleta-suina'),
    tagline: 'Rendimento para o dia a dia.',
    description: 'Corte suíno versátil, bom para assados, cubos e preparos desfiados.',
    uses: ['Assados', 'Cubos', 'Desfiados'], formats: ['Peça inteira', 'Cubos', 'Tiras'],
  },
  {
    id: 'sobrepaleta-suina', name: 'Sobrepaleta suína', category: 'suinos', ...photo('sobrepaleta-suina'),
    tagline: 'Marmoreio suíno, muito sabor.',
    description: 'Também chamada de copa-lombo, tem gordura entremeada que mantém a carne úmida.',
    uses: ['Grelha', 'Assados', 'Bifes'], formats: ['Peça inteira', 'Bifes', 'Sob especificação'],
  },
  // ---------- Linhas padronizadas, moída e complementares (fotos do lote 2) ----------
  {
    id: 'bifes-padronizados', name: 'Bifes padronizados', category: 'sob-medida', ...photo('bifes-padronizados'),
    tagline: 'Mesma espessura, mesmo ponto.',
    description: 'Bifes cortados conforme a especificação da sua cozinha, para preparo previsível e porções iguais.',
    uses: ['Pratos executivos', 'Marmitas', 'Grelha'], formats: ['Espessura sob especificação'],
  },
  {
    id: 'cubos', name: 'Cubos', category: 'sob-medida', ...photo('cubos'),
    tagline: 'Prontos para a panela.',
    description: 'Cortes em cubos regulares, que cozinham por igual e chegam prontos para uso.',
    uses: ['Ensopados', 'Espetos', 'Marmitas'], formats: ['Tamanho sob especificação'],
  },
  {
    id: 'tiras-iscas', name: 'Tiras e iscas', category: 'sob-medida', ...photo('tiras-iscas'),
    tagline: 'Prontas para a chapa.',
    description: 'Tiras uniformes para saltear, rechear ou montar pratos rápidos sem pré-preparo.',
    uses: ['Strogonoff', 'Saltear', 'Delivery'], formats: ['Largura sob especificação'],
  },
  {
    id: 'cortes-personalizados', name: 'Cortes personalizados', category: 'sob-medida', ...photo('cortes-personalizados'),
    tagline: 'Do seu jeito. Na medida certa.',
    description: 'Gramatura, formato e embalagem combinados com a equipe RB, a partir da necessidade da sua operação.',
    uses: ['Fichas técnicas', 'Redes', 'Cardápios autorais'], formats: ['Sob especificação'],
  },
  {
    id: 'carne-moida', name: 'Carne moída', category: 'moida', ...photo('carne-moida'),
    tagline: 'Base da produção, com padrão.',
    description: 'Moída para hambúrgueres, recheios e molhos. Cortes e granulometria sob consulta.',
    uses: ['Hambúrgueres', 'Recheios', 'Molhos'], formats: ['Sob especificação'],
  },
  {
    id: 'molhos-ekma', name: 'Molhos Ekma', category: 'complementares', ...photo('molhos-ekma'),
    needsConfirmation: true,
    tagline: 'Complementos para a mesma entrega.',
    description: 'Linha divulgada pela RB com ketchup, barbecue, mostarda, maionese e outros. Disponibilidade e apresentações sob consulta.',
    uses: ['Hamburguerias', 'Lanchonetes', 'Delivery'], formats: ['Consulte apresentações'],
    note: 'Marca de terceiro: confirmar portfólio atual e direito de uso de nome e imagens.',
  },
];

export function productById(id: string) {
  return products.find((p) => p.id === id);
}

export function srcSet(set: ImageSet, ext: 'avif' | 'webp') {
  return [480, 800, 1120].map((w) => `${set.base}-${w}.${ext} ${Math.min(w, set.w)}w`).join(', ');
}
