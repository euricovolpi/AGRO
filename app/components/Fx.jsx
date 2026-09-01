import {useEffect, useRef} from 'react';

/**
 * Regra de motion da casa: o conteúdo NASCE VISÍVEL. Só depois que o JS
 * confirma que existe (e que o usuário não pediu menos movimento) é que
 * recuamos para o estado inicial da animação. Assim SSR e no-JS entregam a
 * página inteira, e nada some por causa de um bundle que não carregou.
 *
 * @param {{
 *   as?: any;
 *   children: React.ReactNode;
 *   delay?: number;
 *   [key: string]: any;
 * }}
 */
export function Reveal({as: Tag = 'div', children, delay = 0, ...rest}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      !('IntersectionObserver' in window) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    el.classList.add('pendente');

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const alvo = entry.target;
          setTimeout(() => alvo.classList.remove('pendente'), delay);
          io.unobserve(alvo);
        });
      },
      {threshold: 0.12, rootMargin: '0px 0px -8% 0px'},
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} data-reveal="" {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Um único listener de scroll para a página toda: barra de progresso,
 * header colado, parallax do manto e a barra de compra que aparece depois do
 * hero. Vários listeners concorrentes é o caminho mais curto para jank.
 */
export function ScrollFx() {
  const barraRef = useRef(null);

  useEffect(() => {
    const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cabecalho = document.querySelector('.cabecalho');
    const compra = document.querySelector('.mn-barra');
    const peca = document.querySelector('.mn-hero-peca');
    const fundo = document.querySelector('.mn-hero-fundo');

    function aoRolar() {
      const max = document.documentElement.scrollHeight - innerHeight;
      const y = scrollY;

      if (barraRef.current) {
        barraRef.current.style.width = (max ? (y / max) * 100 : 0) + '%';
      }
      cabecalho?.classList.toggle('colado', y > 24);
      // A barra entra depois que o hero saiu — antes disso ela compete com o
      // CTA principal em vez de reforçá-lo.
      compra?.classList.toggle('visivel', y > innerHeight * 0.92);

      if (reduzido) return;

      const p = Math.min(y / innerHeight, 1);
      if (peca) {
        peca.style.transform = `translateY(${p * 64}px) scale(${1 - p * 0.06})`;
        peca.style.opacity = String(1 - p * 0.55);
      }
      if (fundo) {
        fundo.style.transform = `translate(0, calc(-54% + ${p * -70}px))`;
      }
    }

    // Inclinação do manto conforme o ponteiro: dá volume à peça sem tirá-la
    // do lugar. Vai no <img>, porque o pai já carrega o parallax de scroll.
    const hero = document.querySelector('.mn-hero');
    const heroImg = document.querySelector('.mn-hero-peca img');
    function aoMover(e) {
      if (!heroImg) return;
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      heroImg.style.setProperty('--ry', `${x * 9}deg`);
      heroImg.style.setProperty('--rx', `${-y * 6}deg`);
    }
    function aoSair() {
      heroImg?.style.setProperty('--ry', '0deg');
      heroImg?.style.setProperty('--rx', '0deg');
    }

    addEventListener('scroll', aoRolar, {passive: true});
    addEventListener('resize', aoRolar);
    if (!reduzido && hero && matchMedia('(hover: hover)').matches) {
      hero.addEventListener('pointermove', aoMover);
      hero.addEventListener('pointerleave', aoSair);
    }
    aoRolar();
    return () => {
      removeEventListener('scroll', aoRolar);
      removeEventListener('resize', aoRolar);
      hero?.removeEventListener('pointermove', aoMover);
      hero?.removeEventListener('pointerleave', aoSair);
    };
  }, []);

  return (
    <div className="progresso" aria-hidden="true">
      <i ref={barraRef} />
    </div>
  );
}

/**
 * Faixa de texto corrido. A trilha anda -50%, então as duas metades precisam
 * ser idênticas e cada metade precisa ser mais larga que a tela — senão
 * aparece um vazio antes da emenda e o loop deixa de parecer contínuo.
 * @param {{itens: string[]; inverso?: boolean; repeticoes?: number}}
 */
export function Faixa({itens, inverso = false, repeticoes = 3}) {
  const metade = Array.from({length: repeticoes}, () => itens).flat();
  const trilha = [...metade, ...metade];
  return (
    <div className={`faixa${inverso ? ' inverso' : ''}`} aria-hidden="true">
      <div className="faixa-trilho">
        {trilha.map((texto, i) => (
          <span key={i}>{texto}</span>
        ))}
      </div>
    </div>
  );
}

/** Grão fixo sobre a página: o preto puro chapa, o grão devolve profundidade. */
export function Grao() {
  return <div className="grao" aria-hidden="true" />;
}
