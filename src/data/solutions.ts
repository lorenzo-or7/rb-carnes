export type SegmentId = 'restaurante' | 'hamburgueria' | 'lanchonete' | 'marmitaria' | 'delivery' | 'outro';

export const segments: { id: SegmentId; label: string }[] = [
  { id: 'restaurante', label: 'Restaurante' },
  { id: 'hamburgueria', label: 'Hamburgueria' },
  { id: 'lanchonete', label: 'Lanchonete' },
  { id: 'marmitaria', label: 'Marmitaria' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'outro', label: 'Outro' },
];

export interface Solution {
  id: string;
  segment: SegmentId;
  tab: string;
  benefit: string;
  headline: string;
  text: string;
  items: string[];
  image: string;
  imageAlt: string;
}

export const solutions: Solution[] = [
  {
    id: 'restaurantes', segment: 'restaurante', tab: 'Restaurantes',
    benefit: 'Consistência na cozinha',
    headline: 'O mesmo prato, todos os dias.',
    text: 'Cortes personalizados e padronizados conforme a ficha técnica da casa. Menos variação entre turnos e menos retrabalho na bancada.',
    items: ['Cortes personalizados', 'Bifes padronizados', 'Peças para porcionar'],
    image: 'seg-restaurantes', imageAlt: 'Chef finalizando um prato de carne em cozinha profissional (imagem ilustrativa)',
  },
  {
    id: 'hamburguerias', segment: 'hamburgueria', tab: 'Lanchonetes e hamburguerias',
    benefit: 'Agilidade na produção',
    headline: 'Do pedido à chapa, sem pausa.',
    text: 'Carne moída, cortes práticos e a linha de molhos Ekma divulgada pela RB, para montar o cardápio com menos fornecedores.',
    items: ['Carne moída', 'Tiras e iscas', 'Molhos Ekma (sob consulta)'],
    image: 'seg-hamburguerias', imageAlt: 'Montagem de hambúrgueres em cozinha comercial (imagem ilustrativa)',
  },
  {
    id: 'marmitarias', segment: 'marmitaria', tab: 'Marmitarias',
    benefit: 'Controle das porções',
    headline: 'Cada marmita com a mesma medida.',
    text: 'Cubos, tiras e bifes em porções padronizadas, para planejar custo por refeição e montar a linha com previsibilidade.',
    items: ['Cubos', 'Tiras', 'Bifes porcionados'],
    image: 'seg-marmitarias', imageAlt: 'Montagem de refeições porcionadas em marmitas (imagem ilustrativa)',
  },
  {
    id: 'delivery', segment: 'delivery', tab: 'Delivery',
    benefit: 'Praticidade operacional',
    headline: 'Menos preparo entre um pedido e outro.',
    text: 'Soluções que chegam prontas para a etapa de cocção, liberando a equipe para o que o cliente vê: o prato saindo no tempo certo.',
    items: ['Cortes prontos para uso', 'Moída', 'Tiras para saltear'],
    image: 'seg-delivery', imageAlt: 'Refeição embalada e sacola de entrega (imagem ilustrativa)',
  },
];

export const cutFormats = [
  {
    id: 'bifes', label: 'Bifes', title: 'Bifes padronizados',
    text: 'Fatias de espessura uniforme para grelha, chapa e pratos executivos. Mesmo ponto, mesmo tempo de preparo.',
    spec: [['Espessura', 'definida pela sua ficha técnica'], ['Indicado para', 'grelha, chapa, executivos']],
  },
  {
    id: 'cubos', label: 'Cubos', title: 'Cubos regulares',
    text: 'Peças de tamanho regular que cozinham por igual. Prontas para ensopados, espetos e marmitas.',
    spec: [['Tamanho', 'sob especificação'], ['Indicado para', 'ensopados, espetos, marmitas']],
  },
  {
    id: 'tiras', label: 'Tiras', title: 'Tiras e iscas',
    text: 'Cortes longos e finos, prontos para saltear, rechear ou finalizar em poucos minutos.',
    spec: [['Largura', 'sob especificação'], ['Indicado para', 'strogonoff, salteados, delivery']],
  },
  {
    id: 'personalizado', label: 'Sob medida', title: 'Cortes personalizados',
    text: 'Gramaturas e formatos combinados com a equipe RB, a partir do que a sua operação realmente usa.',
    spec: [['Gramatura', 'combinada com a equipe'], ['Indicado para', 'fichas técnicas e redes']],
  },
] as const;

export type CutFormatId = (typeof cutFormats)[number]['id'];
