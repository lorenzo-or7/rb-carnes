import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
// Evita saltos quando a barra de endereço do mobile aparece/some.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
