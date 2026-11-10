import { useTheme } from '../app/theme';

type Variant = 'on-dark' | 'on-light';

function LogoPicture({ v, size, alt, className }: { v: Variant; size: number; alt: string; className?: string }) {
  return (
    <picture className={className}>
      <source type="image/webp" srcSet={`/assets/brand/rb-logo-${v}-480.webp 480w, /assets/brand/rb-logo-${v}-960.webp 960w`} sizes={`${size}px`} />
      <img
        src={`/assets/brand/rb-logo-${v}-480.png`}
        alt={alt}
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: 'contain' }}
        decoding="async"
      />
    </picture>
  );
}

/**
 * Logo RB Carnes original (placa de fundo removida, arte preservada).
 * Sem variante fixa, as duas versões ficam sobrepostas e trocam por crossfade junto com o tema.
 */
export function Logo({ className, size = 56, variant }: { className?: string; size?: number; variant?: Variant }) {
  const { theme } = useTheme();
  if (variant) return <LogoPicture v={variant} size={size} alt="RB Carnes" className={className} />;
  return (
    <span className={`logo-x ${className ?? ''}`} style={{ width: size, height: size }}>
      <LogoPicture v="on-dark" size={size} alt={theme === 'dark' ? 'RB Carnes' : ''} className="logo-x__v logo-x__v--dark" />
      <LogoPicture v="on-light" size={size} alt={theme === 'light' ? 'RB Carnes' : ''} className="logo-x__v logo-x__v--light" />
    </span>
  );
}
