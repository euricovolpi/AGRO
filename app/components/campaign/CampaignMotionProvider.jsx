import {createContext, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {gsap, ScrollTrigger} from '~/lib/gsap';
import Lenis from 'lenis';
import {useReducedMotion} from '~/hooks/useReducedMotion';
import {faixaDe} from '~/lib/campaign-motion';

const MotionContext = createContext({
  pronto: false,
  reduzido: false,
  faixa: 'desktop',
  registrarCena: () => {},
});

export function useCampaignMotion() {
  return useContext(MotionContext);
}

/**
 * Ponte única entre Lenis, GSAP e ScrollTrigger (§6 da spec).
 *
 * Uma instância para a página inteira. Cada cena cria a própria timeline com
 * `useGSAP({scope})`, que limpa sozinha ao desmontar — assim voltar pelo
 * histórico do navegador não deixa trigger órfão prendendo o scroll.
 *
 * O provider nunca decide o que aparece: o conteúdo já nasce visível no SSR.
 * Ele só liga o motor e diz às cenas quando é seguro animar.
 *
 * @param {{children: React.ReactNode}}
 */
export function CampaignMotionProvider({children}) {
  const reduzido = useReducedMotion();
  const [pronto, setPronto] = useState(false);
  const [faixa, setFaixa] = useState('desktop');
  const cenasVistas = useRef(new Set());

  // O registro do GSAP acontece no import de `~/lib/gsap` — cedo o bastante
  // para as cenas filhas encontrarem o ScrollTrigger pronto.
  useEffect(() => {
    setFaixa(faixaDe());
  }, []);

  // Espelha a preferência de movimento no <html>. O script inline do root já
  // marcou a classe antes da primeira pintura; aqui só mantemos em dia se o
  // usuário mudar a preferência com a página aberta.
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.add('motion-ready');
    raiz.classList.toggle('reduce-motion', reduzido);
  }, [reduzido]);

  // Lenis: existe só para dar continuidade à rolagem. Em reduced motion não é
  // instanciado — suavizar rolagem é exatamente o tipo de movimento induzido
  // que a preferência pede para desligar.
  useEffect(() => {
    if (reduzido) return undefined;

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    if (import.meta.env?.DEV) window.__LENIS = lenis;

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [reduzido]);

  /**
   * Refresh é caro e mede a página inteira. Só depois que fonte e imagem
   * principal assentaram — senão os pins nascem calculados com a altura
   * errada e saltam quando a tipografia troca.
   */
  useEffect(() => {
    let vivo = true;

    async function liberar() {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {
        // fonte não é bloqueante para a narrativa
      }

      const lcp = document.querySelector('[data-lcp]');
      if (lcp?.decode) {
        try {
          await lcp.decode();
        } catch {
          // imagem quebrada não pode travar o motion
        }
      }

      if (!vivo) return;
      ScrollTrigger.refresh();
      setPronto(true);
    }

    liberar();
    return () => {
      vivo = false;
    };
  }, []);

  // Resize com debounce: sem isso, arrastar a borda da janela dispara dezenas
  // de refreshes e a página trava.
  useEffect(() => {
    let t;
    function agendar() {
      clearTimeout(t);
      t = setTimeout(() => {
        setFaixa(faixaDe());
        ScrollTrigger.refresh();
      }, 200);
    }
    addEventListener('resize', agendar);
    addEventListener('orientationchange', agendar);
    return () => {
      clearTimeout(t);
      removeEventListener('resize', agendar);
      removeEventListener('orientationchange', agendar);
    };
  }, []);

  const valor = useMemo(
    () => ({
      pronto,
      reduzido,
      faixa,
      /**
       * Marca a cena como vista, uma vez por pageview. Devolve `false` quando
       * já foi contada, para o chamador não emitir evento repetido.
       * @param {string} cena
       */
      registrarCena(cena) {
        if (cenasVistas.current.has(cena)) return false;
        cenasVistas.current.add(cena);
        return true;
      },
    }),
    [pronto, reduzido, faixa],
  );

  return <MotionContext.Provider value={valor}>{children}</MotionContext.Provider>;
}
