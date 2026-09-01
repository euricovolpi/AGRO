import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {gsap, ScrollTrigger} from '~/lib/gsap';
import Lenis from 'lenis';
import {useReducedMotion} from '~/hooks/useReducedMotion';
import {faixaDe} from '~/lib/campaign-motion';
import {criarRegistroDeEventos} from '~/lib/eventos';

const MotionContext = createContext({
  pronto: false,
  reduzido: false,
  falhou: false,
  ativo: false,
  faixa: 'desktop',
  registrarEvento: () => false,
  assinarScroll: () => () => {},
});

export function useCampaignMotion() {
  return useContext(MotionContext);
}

/**
 * Ponte única entre Lenis, GSAP e ScrollTrigger.
 *
 * Uma instância para a página inteira. Cada cena cria a própria timeline com
 * `useGSAP({scope})`, que limpa sozinha ao desmontar — assim voltar pelo
 * histórico do navegador não deixa trigger órfão prendendo o scroll.
 *
 * O provider nunca decide o que aparece: o conteúdo já nasce visível no SSR.
 * Ele liga o motor, avisa às cenas quando é seguro animar, e confirma ao
 * watchdog do boot que o movimento assumiu o controle.
 *
 * @param {{children: React.ReactNode}}
 */
export function CampaignMotionProvider({children}) {
  const reduzido = useReducedMotion();
  const [pronto, setPronto] = useState(false);
  // Lido de forma síncrona, como a preferência de movimento: se descobrirmos
  // a falha só no primeiro efeito, as cenas já terão criado os pins que o
  // fail-open existe para não ter.
  const [falhou] = useState(() =>
    typeof document === 'undefined'
      ? false
      : document.documentElement.classList.contains('motion-failed'),
  );
  const [faixa, setFaixa] = useState('desktop');
  const eventosEmitidos = useRef(criarRegistroDeEventos());
  const assinantesScroll = useRef(new Set());

  // Se o watchdog do boot já disparou, o CSS que esconde conteúdo foi
  // removido. Animar agora reesconderia tudo por estilo inline — exatamente o
  // que o fail-open existe para impedir.
  //
  // E a confirmação vai junto, na montagem: a pergunta do watchdog é "o
  // JavaScript assumiu?", e a resposta já é sim aqui. Amarrá-la ao
  // `ScrollTrigger.refresh()`, que espera fontes, estourava os 2,5 s em
  // aparelho lento — e a página caía em fail-open justamente onde o movimento
  // funcionaria.
  useEffect(() => {
    // Em fail-open o prólogo não roda, então ninguém devolveria o header.
    if (falhou) document.documentElement.classList.remove('intro-ativa');
  }, [falhou]);

  const ativo = !reduzido && !falhou;

  useEffect(() => {
    setFaixa(faixaDe());
  }, []);

  // Espelha a preferência de movimento no <html>. O script inline do root já
  // marcou as classes antes da primeira pintura; aqui só mantemos em dia se o
  // usuário mudar a preferência com a página aberta.
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduzido);
  }, [reduzido]);

  /**
   * Hub de scroll: um listener para a página toda.
   *
   * Header e tema da seção clara precisam saber a posição da rolagem. Cada um
   * com o próprio listener significa leituras de layout repetidas por evento e
   * caminhos de atualização competindo com o Lenis. Aqui a leitura é uma só,
   * coalescida por frame, e os assinantes recebem o valor pronto.
   */
  useEffect(() => {
    let frame = 0;
    function despachar() {
      frame = 0;
      const y = scrollY;
      assinantesScroll.current.forEach((fn) => fn(y));
    }
    function agendar() {
      if (frame) return;
      frame = requestAnimationFrame(despachar);
    }
    addEventListener('scroll', agendar, {passive: true});
    addEventListener('resize', agendar);
    despachar();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      removeEventListener('scroll', agendar);
      removeEventListener('resize', agendar);
    };
  }, []);

  const assinarScroll = useCallback((fn) => {
    assinantesScroll.current.add(fn);
    if (typeof window !== 'undefined') fn(scrollY);
    return () => assinantesScroll.current.delete(fn);
  }, []);

  // Lenis existe só para dar continuidade à rolagem. Em movimento reduzido ou
  // com o boot falho não é instanciado — suavizar rolagem é exatamente o tipo
  // de movimento induzido que a preferência pede para desligar.
  useEffect(() => {
    if (!ativo) return undefined;

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    if (window.__ST) window.__LENIS = lenis;

    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete window.__LENIS;
    };
  }, [ativo]);

  /**
   * Refresh é caro e mede a página inteira. Só depois que fonte e imagem
   * principal assentaram — senão os pins nascem calculados com a altura
   * errada e saltam quando a tipografia troca.
   *
   */
  useEffect(() => {
    let vivo = true;

    async function liberar() {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {
        // fonte não é bloqueante para a narrativa
      }

      // Só a fonte. Esperar por uma imagem abaixo da dobra empurrava o
      // `refresh` para depois de 5 s: os pins nasciam tarde, e a inserção dos
      // espaçadores virava um salto de layout de 0,18 de CLS.
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
      falhou,
      ativo,
      faixa,
      assinarScroll,
      /**
       * Marca um evento como emitido nesta pageview e diz se ele é inédito.
       *
       * O conjunto vive no provider, não nas cenas: com scrub, atravessar a
       * mesma cena de novo — rolando para cima e voltando — dispara o callback
       * de entrada outra vez, e um marco narrativo contado duas vezes
       * corrompe o funil.
       *
       * @param {string} chave
       * @returns {boolean} `true` na primeira vez, `false` nas seguintes
       */
      registrarEvento(chave) {
        return eventosEmitidos.current.registrar(chave);
      },
    }),
    [pronto, reduzido, falhou, ativo, faixa, assinarScroll],
  );

  return <MotionContext.Provider value={valor}>{children}</MotionContext.Provider>;
}
