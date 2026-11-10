import { useLayoutEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { gsap } from '../app/gsap';
import { AnimatedContent } from '../components/AnimatedContent';
import { press } from '../data/company';

export function Press() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      // Camadas separadas: o artigo recebe só o parallax (transform); o papel, só a máscara (clip-path).
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const st = { trigger: '.press__clip', start: 'top 82%', once: true };
        gsap
          .timeline({ scrollTrigger: st })
          .fromTo('.press__paper', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power3.inOut', clearProps: 'clipPath' })
          .from('.press__paper > *', { opacity: 0, y: 14, duration: 0.8, stagger: 0.09, ease: 'power3.out' }, 0.45);
      });
      // Parallax só em telas largas: no celular e no tablet o jornal fica estável e legível.
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1024px)', () => {
        gsap.fromTo('.press__clip', { yPercent: 6, rotate: -0.8 }, { yPercent: -4, rotate: 0.4, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
        gsap.fromTo('.press__stamp', { yPercent: 30, opacity: 0 }, { yPercent: -10, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'center center', scrub: 0.6 } });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="imprensa" ref={root} className="press section" aria-labelledby="press-title" tabIndex={-1}>
      <div className="container press__grid">
        <div className="press__intro">
          <AnimatedContent>
            <p className="eyebrow">Destaque na imprensa</p>
          </AnimatedContent>
          <AnimatedContent delay={80}>
            <h2 id="press-title" className="serif h2">
              Registrado <em>em notícia.</em>
            </h2>
          </AnimatedContent>
          <AnimatedContent delay={160}>
            <p className="lead">
              Em dezembro de 2021, a Cidasc, companhia vinculada ao Governo de Santa Catarina, noticiou a adesão da RB Carnes ao Serviço de Inspeção Estadual.
            </p>
          </AnimatedContent>
          <div className="press__stamp" aria-hidden="true">
            <span className="serif">03.12<em>.2021</em></span>
            <span className="press__stamp-label">Registro · Cidasc</span>
          </div>
          <AnimatedContent delay={220}>
            <p className="note press__disclaimer">
              Registro histórico atribuído à fonte. Não constitui atestado da situação atual de certificações.
            </p>
          </AnimatedContent>
        </div>

        <article className="press__clip">
          <div className="press__paper" aria-labelledby="press-headline">
            <header className="press__masthead">
              <span>{press.outlet}</span>
              <span>Notícias · Santa Catarina</span>
              <time dateTime={press.date}>{press.dateLabel}</time>
            </header>
            <h3 id="press-headline" className="serif press__headline">
              “{press.headline}”
            </h3>
            <div className="press__cols">
              <p>
                <span className="press__dropcap serif">S</span>egundo a Cidasc, a empresa de São José recebeu em 1º de dezembro de 2021, em sua sede, o certificado do Serviço de Inspeção Estadual, etapa buscada para ampliar sua área de atuação.
              </p>
              <p>
                A matéria lembra a trajetória da casa: o início ligado à demanda de lanchonetes de Florianópolis, a ampliação de 160 m² para 220 m² em 2019 e a nova sede de 800 m², inaugurada em novembro de 2021.
              </p>
            </div>
            <footer className="press__foot">
              <span>Resumo editorial com base na reportagem original.</span>
              <a href={press.url} target="_blank" rel="noopener noreferrer" className="press__link">
                Ler a matéria na Cidasc <ArrowUpRight aria-hidden="true" />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </footer>
          </div>
        </article>
      </div>
    </section>
  );
}
