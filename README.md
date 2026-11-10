# RB Carnes — protótipo demonstrativo B2B

Site de página única (React 18 + TypeScript + Vite 6, GSAP/ScrollTrigger, Motion, Tailwind 4 + CSS com tokens). Sem 3D desde a v3. Temas Black Gold e Ivory Gold.

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:5173
```

Versão de produção (recomendada para apresentação):

```bash
npm run build
npm run preview    # http://localhost:4173
```


## Scripts

| Comando | O que faz |
|---|---|
| `npm run typecheck` / `npm run lint` | TypeScript estrito / ESLint |
| `npm test` | testes unitários (Vitest) |
| `npm run test:e2e` | Playwright: desktop 1440 + Pixel 7, fluxos, axe, 10 larguras × 2 temas |
| `node scripts/optimize-v3.mjs` | hero oficial (claro/escuro) e ilustrações do manifesto |
| `node scripts/optimize-images.mjs` | gera AVIF/WebP/JPEG responsivos e logos sem placa (`LOGO_DARK`/`LOGO_LIGHT`) |
| `node scripts/qa-shots.mjs <url> <pasta> <w> <h> <tema>` | capturas de QA por seção (22 quadros) |
| `node scripts/qa-sheet.mjs <pasta> <prefixo>` | folha de contato das capturas |

## v2 — notas de direção

- Botões: sistema editorial retangular (`src/styles/buttons.css`); o vermelho ficou para erros e acentos.
- Hero: palco fotográfico em tela cheia nos dois temas; no Ivory Gold o véu é grafite quente e a base se dissolve no marfim.
- O Corte do Tempo: scroll com pausas de leitura por capítulo (`src/data/timeline.ts`, `toClip`/`chapterAt`), tempo da animação controlado manualmente (sem `LoopOnce`).
- Cortes Sob Medida: sequência fotográfica com as imagens reais dos formatos (o 3D de blocos foi removido).
- Catálogo: grade com seleção curada de 8 itens, filtros e "Mostrar todos"; Peça/Textura dirigido só por estado.

Os originais recebidos ficam em `_incoming/` (fora do git).

## Dados comerciais

`src/data/config.ts` concentra o que depende de confirmação da RB (`needsConfirmation: true`): WhatsApp comercial (`WHATSAPP_SALES_E164`), e-mail, horários, link de mapa, área de atendimento, corte das 14h, URL do portfólio Or7 e a arte da assinatura Or7. Nada marcado como pendente aparece como fato no site. Com um número E.164 confirmado, o botão "Enviar pelo WhatsApp" do Concierge passa a abrir `wa.me` só por clique.

## Assinatura Or7

Coloque a arte original em `public/assets/brand/` e preencha `or7SignatureSrc` (com `needsConfirmation: false`). Ela é exibida sem alteração sobre placa preta nos dois temas.

## v3 — notas

- Hero: artes oficiais Black Gold / Ivory Gold no mesmo quadro, crossfade de 0,85 s sincronizado com a troca de tema; título em faixa editorial abaixo da arte.
- Manifesto: declaração com tamanho controlado + slideshow das ilustrações Carnes / Tempo / Soluções (pausa, anterior/próxima, sem autoplay com movimento reduzido).
- O Corte do Tempo: Living Archive sem 3D (GLB, Three.js e R3F removidos do projeto).
- Food Service: os três atos foram removidos; seção comercial de benefícios + vitrine por segmento.
- Concierge etapa 3: campos em subgrid (rótulo, campo e ajuda alinhados).
- Extensão do hero: faixa do topo de cada arte oficial esticada e suavizada (hero-*-extend.webp, gerada por scripts/hero-extend.mjs), sem recorte nem alteração da arte.
