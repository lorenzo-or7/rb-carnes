import { useRef, type ElementType, type ReactNode, type CSSProperties } from 'react';
import { useInView } from '../hooks/useInView';

/**
 * Revela conteúdo ao entrar na viewport.
 * Adaptado do conceito "Animated Content" (React Bits): direção, distância e atraso
 * configuráveis, aqui em CSS puro (transform/opacity/clip-path) e com reduced motion.
 */
export function AnimatedContent({
  as: Tag = 'div',
  children,
  className = '',
  variant = 'rise',
  delay = 0,
  style,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  variant?: 'rise' | 'clip' | 'fade';
  delay?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { rootMargin: '0px 0px -12% 0px', once: true });
  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${variant} ${inView ? 'is-in' : ''} ${className}`}
      style={{ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
