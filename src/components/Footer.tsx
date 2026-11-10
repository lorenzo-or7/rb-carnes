import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../app/gsap';
import { company } from '../data/company';
import { config, confirmed } from '../data/config';
import { Logo } from './Logo';

const EXPLORE = [
  { href: '#produtos', label: 'Produtos' },
  { href: '#historia', label: 'Nossa História' },
  { href: '#qualidade', label: 'Qualidade' },
  { href: '#solucoes', label: 'Soluções' },
  { href: '#contato', label: 'Contato' },
];

/** Assinatura Or7 — só a arte original enviada pelo autor, sobre placa preta, sem recriação. */
function Or7Signature() {
  const src = confirmed(config.or7SignatureSrc);
  if (!src) {
    // Arte original ainda não recebida: não é recriada com texto (regra da marca).
    return import.meta.env.DEV ? (
      <div className="or7-slot" data-testid="or7-missing">
        Assinatura Or7: arquivo original pendente
      </div>
    ) : null;
  }
  const img = (
    <picture>
      <source type="image/webp" srcSet={src} />
      <img
        src={src.replace(/\.webp$/, '.png')}
        alt="Or7 — Idealizado e desenvolvido por Lorenzo Orsetti"
        className="or7__img"
        width={900}
        height={128}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
  const url = confirmed(config.or7PortfolioUrl);
  return (
    <div className="or7" data-testid="or7-signature">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
}

export function Footer() {
  const hours = confirmed(config.businessHours);
  const email = confirmed(config.email);
  const map = confirmed(config.mapUrl);
  const root = useRef<HTMLElement>(null);
  // Entrada editorial discreta: colunas em sequência e base por último. A assinatura Or7 só recebe opacidade do bloco.
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
          .from('.footer__top > *', { opacity: 0, y: 18, duration: 0.85, stagger: 0.08, ease: 'power3.out' })
          .from('.footer__base', { opacity: 0, duration: 0.8, ease: 'power2.out' }, 0.35);
      });
    }, el);
    return () => ctx.revert();
  }, []);
  const a = company.address;
  return (
    <footer ref={root} className="footer" id="rodape">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo size={88} />
            <p className="serif footer__slogan">
              <em>“{company.slogan}”</em>
            </p>
            <p className="small muted footer__about">
              Distribuição e soluções em carnes para quem vive da cozinha profissional. {company.positioning}.
            </p>
          </div>

          <div className="footer__col">
            <h2 className="footer__label">Explore</h2>
            <ul role="list">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h2 className="footer__label">Localização</h2>
            <address>
              {a.street}
              <br />
              {a.district}, {a.city} — {a.state}
              <br />
              CEP {a.zip}
            </address>
            {map ? (
              <a href={map} target="_blank" rel="noopener noreferrer" className="footer__link">
                Ver no mapa
              </a>
            ) : (
              <p className="note">Link de mapa ativado após confirmação do endereço.</p>
            )}
          </div>

          <div className="footer__col">
            <h2 className="footer__label">Atendimento</h2>
            <p>Atendimento comercial para operações de food service.</p>
            {email && <a href={`mailto:${email}`}>{email}</a>}
            {hours ? <p>{hours}</p> : <p className="muted">Canais e horários: consulte nossa equipe.</p>}
            <a href="#contato" className="footer__link">
              Montar solicitação
            </a>
          </div>
        </div>

        <div className="footer__base">
          <p>
            © {new Date().getFullYear()} {company.legalName} · CNPJ {company.cnpj}
          </p>
          {config.isDemo && (
            <p className="footer__demo">Protótipo demonstrativo. Fotografias ilustrativas; informações comerciais sujeitas a confirmação.</p>
          )}
          <Or7Signature />
        </div>
      </div>
    </footer>
  );
}
