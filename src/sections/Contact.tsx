import { ArrowRight, ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Navigation, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { AnimatedContent } from '../components/AnimatedContent';
import { company } from '../data/company';
import { config, confirmed, getWhatsAppNumber } from '../data/config';
import { useConcierge } from '../concierge/ConciergeContext';

function Channel({ icon, label, children, status, action }: { icon: ReactNode; label: string; children: ReactNode; status?: 'ok' | 'pending'; action?: ReactNode }) {
  return (
    <li className="channel">
      <span className="channel__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="channel__body">
        <p className="channel__label">
          {label}
          {status === 'pending' && <span className="channel__status">Em confirmação</span>}
        </p>
        <div className="channel__value">{children}</div>
      </div>
      {action && <div className="channel__action">{action}</div>}
    </li>
  );
}

export function Contact() {
  const { open, state } = useConcierge();
  const wa = getWhatsAppNumber();
  const email = confirmed(config.email);
  const hours = confirmed(config.businessHours);
  const map = confirmed(config.mapUrl);
  const area = confirmed(config.serviceArea);
  const a = company.address;
  const n = state.items.length;

  return (
    <section id="contato" className="contact section" aria-labelledby="contact-title" tabIndex={-1}>
      <div className="container contact__grid">
        <div className="contact__intro">
          <AnimatedContent>
            <p className="eyebrow">Contato comercial</p>
          </AnimatedContent>
          <AnimatedContent delay={80}>
            <h2 id="contact-title" className="serif h1 contact__title">
              Vamos conversar sobre <em>seu negócio?</em>
            </h2>
          </AnimatedContent>
          <AnimatedContent delay={140}>
            <p className="lead">
              Fale com a equipe pelos canais abaixo ou monte uma solicitação detalhada no RB Concierge: tipo de operação, cortes, formatos e volume, revisados antes de enviar.
            </p>
          </AnimatedContent>

          <AnimatedContent delay={200} className="concierge-card">
            <p className="concierge-card__kicker">RB Concierge · 4 etapas</p>
            <p className="serif concierge-card__title">Seu negócio. Sua necessidade. Nossa solução.</p>
            <button type="button" className="btn btn--primary btn-ihb" onClick={() => open()} data-testid="contact-cta">
              {n ? `Continuar solicitação (${n})` : 'Montar solicitação'} <ArrowRight aria-hidden="true" />
            </button>
            {!wa && (
              <p className="note">Nesta demonstração, a solicitação é preparada para cópia. O envio direto será ativado com o canal comercial oficial.</p>
            )}
          </AnimatedContent>
        </div>

        <AnimatedContent as="ul" className="channels" delay={120}>
          <Channel
            icon={<MessageCircle />}
            label="WhatsApp comercial"
            status={wa ? 'ok' : 'pending'}
            action={
              wa ? (
                <a className="btn btn--ghost btn--sm" href={`https://wa.me/${wa.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                  Abrir <ArrowUpRight aria-hidden="true" />
                </a>
              ) : undefined
            }
          >
            {wa ? <p>{wa}</p> : <p className="muted">Número oficial ainda não confirmado. Use o RB Concierge para preparar sua mensagem.</p>}
          </Channel>
          <Channel icon={<Mail />} label="E-mail" status={email ? 'ok' : 'pending'}>
            {email ? <a href={`mailto:${email}`}>{email}</a> : <p className="muted">Endereço comercial em confirmação.</p>}
          </Channel>
          <Channel icon={<MapPin />} label="Endereço">
            <address>
              {a.street}
              <br />
              {a.district}, {a.city} — {a.state} · CEP {a.zip}
            </address>
          </Channel>
          <Channel
            icon={<Navigation />}
            label="Localização"
            status={map ? 'ok' : 'pending'}
            action={
              map ? (
                <a className="btn btn--ghost btn--sm" href={map} target="_blank" rel="noopener noreferrer">
                  Ver no mapa <ArrowUpRight aria-hidden="true" />
                </a>
              ) : undefined
            }
          >
            <p className="muted">{map ? 'São José, Grande Florianópolis.' : 'Link de mapa será ativado após a confirmação do endereço.'}</p>
          </Channel>
          <Channel icon={<Clock />} label="Horário de atendimento" status={hours ? 'ok' : 'pending'}>
            <p className={hours ? '' : 'muted'}>{hours ?? 'Horários em confirmação com a equipe RB.'}</p>
          </Channel>
          <Channel icon={<Users />} label="Região atendida" status={area ? 'ok' : 'pending'}>
            <p className={area ? '' : 'muted'}>{area ? `Atendimento em ${area}.` : 'A RB divulga atendimento na Grande Florianópolis; cobertura atual em confirmação.'}</p>
          </Channel>
        </AnimatedContent>
      </div>
    </section>
  );
}
