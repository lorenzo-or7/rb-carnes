export interface Chapter {
  year: string;
  label: string;
  title: string;
  text: string;
  source: string;
  /**
   * Fotografia futura do capítulo (caminho em /public). Enquanto ausente,
   * a seção renderiza um quadro reservado e não faz nenhuma requisição.
   */
  image?: { src: string; alt: string; width: number; height: number };
}

export const chapters: Chapter[] = [
  {
    year: '2001',
    label: 'Corte 1',
    title: 'Onde tudo começa.',
    text: 'A RB Carnes nasce em São José (SC) a partir de uma demanda de lanchonetes de Florianópolis, que precisavam de hambúrguer com regularidade. Desde o primeiro dia, o cliente é a cozinha profissional.',
    source: 'Ano de fundação conforme dados cadastrais; origem relatada pela Cidasc (2021).',
  },
  {
    year: '2019',
    label: 'Corte 2',
    title: 'Crescer com estrutura.',
    text: 'A estrutura física da operação cresce de 160 m² para 220 m². Mais espaço para preparar, porcionar e expedir.',
    source: 'Relato histórico da Cidasc, 03/12/2021.',
  },
  {
    year: '2021',
    label: 'Corte 3',
    title: 'Um novo capítulo.',
    text: 'Nova sede de 800 m² inaugurada em novembro. Em 1º de dezembro, a empresa recebe o certificado de adesão ao Serviço de Inspeção Estadual.',
    source: 'Notícia da Cidasc, 03/12/2021. Registro histórico, não atestado de situação atual.',
  },
];

/**
 * Living Archive: janelas do scroll (0–1) de cada capítulo.
 * Introdução até 0,12; depois cada capítulo tem aproximadamente um terço do percurso.
 */
export const WINDOWS: [number, number][] = [
  [0.12, 0.41],
  [0.41, 0.7],
  [0.7, 1.01],
];
export function chapterAt(p: number) {
  return WINDOWS.findIndex(([a, b]) => p >= a && p < b);
}

/** Alias descritivo usado pela seção Living Archive. */
export const historyChapters = chapters;
