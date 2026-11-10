import { useState, type CSSProperties } from 'react';
import { sceneManifest, srcSet, type ImageSet } from '../data/products';

interface Props {
  set: ImageSet;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  style?: CSSProperties;
}

/** <picture> com AVIF/WebP responsivos, dimensões explícitas e fallback apresentável. */
export function Picture({ set, alt, sizes, className, priority, style }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`img-fallback ${className ?? ''}`} role="img" aria-label={alt} style={style}>
        <span>RB</span>
      </div>
    );
  }
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(set, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(set, 'webp')} sizes={sizes} />
      <img
        src={`${set.base}-800.jpg`}
        alt={alt}
        width={set.w}
        height={set.h}
        className={className}
        style={style}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        // @ts-expect-error fetchpriority ainda não tipado no React 18
        fetchpriority={priority ? 'high' : 'auto'}
        onError={() => setFailed(true)}
      />
    </picture>
  );
}

/** Para imagens referenciadas por base (soluções). */
export function pictureSet(base: string, w = 1122, h = 1402): ImageSet {
  return { base, w, h };
}

/** Fotografias de cena (Food Service, segmentos): 640/1080/1600, AVIF/WebP + JPEG. */
export function ScenePicture({ slug, alt, sizes, className, priority, position }: { slug: string; alt: string; sizes: string; className?: string; priority?: boolean; position?: string }) {
  const meta = sceneManifest[slug];
  const [failed, setFailed] = useState(false);
  if (!meta || failed) {
    return (
      <div className={`img-fallback ${className ?? ''}`} role="img" aria-label={alt}>
        <span>RB</span>
      </div>
    );
  }
  const set = (ext: string) => [640, 1080, 1600].map((w) => `/assets/scenes/${slug}-${w}.${ext} ${Math.min(w, meta.w)}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={set('webp')} sizes={sizes} />
      <img
        src={`/assets/scenes/${slug}-1080.jpg`}
        alt={alt}
        width={meta.w}
        height={meta.h}
        className={className}
        style={position ? { objectPosition: position } : undefined}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
      />
    </picture>
  );
}
