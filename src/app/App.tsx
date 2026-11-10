import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Hero } from '../sections/Hero';
import { Manifesto } from '../sections/Manifesto';
import { History } from '../sections/History';
import { Press } from '../sections/Press';
import { Catalog } from '../sections/Catalog';
import { Cuts } from '../sections/Cuts';
import { FoodService } from '../sections/FoodService';
import { Quality } from '../sections/Quality';
import { Contact } from '../sections/Contact';
import { Concierge } from '../concierge/Concierge';
import { useConcierge } from '../concierge/ConciergeContext';

function GlobalAnnouncer() {
  const { announcement, isOpen } = useConcierge();
  return (
    <p className="sr-only" aria-live="polite">
      {isOpen ? '' : announcement}
    </p>
  );
}

export function App() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Navbar />
      <main id="conteudo" tabIndex={-1}>
        <Hero />
        <Manifesto />
        <History />
        <Press />
        <Catalog />
        <Cuts />
        <FoodService />
        <Quality />
        <Contact />
      </main>
      <Footer />
      <Concierge />
      <GlobalAnnouncer />
    </>
  );
}
