/**
 * Tokens de motion da campanha "Vista o Começo".
 *
 * Tudo que é número mágico de tempo, distância ou altura de cena mora aqui.
 * Espalhar isso pelas cenas é como o ritmo de uma página se perde: cada
 * capítulo passa a ter a própria noção de "devagar".
 */

/** Breakpoints de composição (§10 da spec). */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
  wide: 1440,
};

export const MOTION = {
  ease: 'power3.out',
  easeIn: 'power2.inOut',

  /**
   * Scrub por natureza de cena. Narrativa arrasta um pouco — dá peso.
   * Produto responde quase direto, senão a rotação parece emborrachada.
   */
  scrub: {
    narrative: 0.8,
    product: 0.45,
    ambient: 1.2,
  },

  /** Distância de scroll de cada cena pinada, em % de viewport. */
  desktop: {
    origin: '+=180%',
    hero: '+=230%',
    field: '+=260%',
    shield: '+=250%',
    reveal: '+=210%',
    turntable: '+=330%',
    ainda: '+=130%',
    final: '+=180%',
  },
  mobile: {
    origin: '+=145%',
    hero: '+=190%',
    field: '+=210%',
    shield: '+=210%',
    reveal: '+=180%',
    turntable: '+=270%',
    ainda: '+=110%',
    final: '+=160%',
  },
};

/** Durações em segundos, espelhando os tokens CSS. */
export const DUR = {
  fast: 0.42,
  base: 0.76,
  slow: 1.1,
  cinema: 1.6,
};

/**
 * Nomes de cena. Usados para o índice, para os eventos de analytics e para os
 * ids de ScrollTrigger — um lugar só, sem string solta.
 */
export const CENAS = {
  origem: 'origem',
  hero: 'hero',
  campo: 'campo',
  certidao: 'certidao',
  escudo: 'escudo',
  reveal: 'reveal',
  turntable: 'turntable',
  detalhes: 'detalhes',
  ainda: 'ainda',
  final: 'final',
};

/**
 * @param {number} [largura]
 * @returns {'mobile' | 'tablet' | 'desktop'}
 */
export function faixaDe(largura) {
  const w = largura ?? (typeof window === 'undefined' ? 1440 : window.innerWidth);
  if (w >= BREAKPOINTS.desktop) return 'desktop';
  if (w >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

/**
 * Distância de scroll da cena na faixa atual. Tablet segue o desktop, com
 * as cenas um pouco mais curtas.
 * @param {keyof MOTION['desktop']} cena
 * @param {number} [largura]
 */
export function alturaCena(cena, largura) {
  const faixa = faixaDe(largura);
  if (faixa === 'mobile') return MOTION.mobile[cena];
  return MOTION.desktop[cena];
}
