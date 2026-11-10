import { useRef } from 'react';
import { AnimatedContent } from '../components/AnimatedContent';

const PILLARS = [
  {
    k: '2001',
    title: 'Trajetória local',
    text: 'Uma empresa de São José (SC) que cresceu atendendo cozinhas profissionais da região.',
  },
  {
    k: '800 m²',
    title: 'Estrutura própria',
    text: 'Sede inaugurada em 2021, segundo registro da Cidasc. Espaço pensado para preparar e expedir.',
  },
  {
    k: 'Padrão',
    title: 'Cortes sob especificação',
    text: 'Formato, porção e espessura combinados com cada cliente, para o resultado se repetir pedido a pedido.',
  },
  {
    k: 'B2B',
    title: 'Atendimento consultivo',
    text: 'Orçamentos montados a partir da necessidade de cada operação, sem tabela pública de preços.',
  },
];

/**
 * Confiança, qualidade e operação.
 * Grade com spotlight que segue o ponteiro (conceito "Feature Grid Spotlight", 21st.dev),
 * reescrita com variáveis CSS. Em toque/teclado o destaque fica no foco.
 */
export function Quality() {
  const grid = useRef<HTMLUListElement>(null);
  return (
    <section id="qualidade" className="quality section" aria-labelledby="quality-title" tabIndex={-1}>
      <div className="container">
        <div className="quality__head">
          <AnimatedContent>
            <p className="eyebrow">Confiança, qualidade e operação</p>
          </AnimatedContent>
          <AnimatedContent delay={80}>
            <h2 id="quality-title" className="serif h2">
              Confiança se constrói <em>no dia a dia.</em>
            </h2>
          </AnimatedContent>
          <AnimatedContent delay={140}>
            <p className="lead">
              Nada de selos de enfeite. O que sustenta a relação com cada cliente é história, estrutura e um padrão que se repete.
            </p>
          </AnimatedContent>
        </div>

        <ul
          ref={grid}
          role="list"
          className="quality__grid"
          onPointerMove={(e) => {
            const items = grid.current?.querySelectorAll<HTMLElement>('.quality__item');
            items?.forEach((it) => {
              const r = it.getBoundingClientRect();
              it.style.setProperty('--mx', `${e.clientX - r.left}px`);
              it.style.setProperty('--my', `${e.clientY - r.top}px`);
            });
          }}
        >
          {PILLARS.map((p, i) => (
            <AnimatedContent as="li" key={p.title} className="quality__item" delay={i * 90}>
              <p className="quality__k serif">{p.k}</p>
              <h3 className="quality__title">{p.title}</h3>
              <p className="quality__text">{p.text}</p>
            </AnimatedContent>
          ))}
        </ul>
        <p className="note quality__note">
          Informações históricas atribuídas à Cidasc (2021) e a dados cadastrais. Certificações e condições comerciais vigentes devem ser confirmadas com a RB Carnes.
        </p>
      </div>
    </section>
  );
}
