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
        {/* A trilha é a mesma lista repetida de propósito, então índice é a
            única chave estável possível — e o bloco é decorativo. */}
        {trilha.map((texto, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={`${texto}-${i}`}>{texto}</span>
        ))}
      </div>
    </div>
  );
}

/** Grão fixo sobre a página: o preto puro chapa, o grão devolve profundidade. */
export function Grao() {
  return <div className="grao" aria-hidden="true" />;
}
