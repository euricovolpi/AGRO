import {useEffect, useState} from 'react';

/**
 * `prefers-reduced-motion` como estado reativo.
 *
 * O valor é lido de forma síncrona já na primeira renderização do cliente.
 * Não dá para começar em `false` e corrigir num efeito: os efeitos das cenas
 * rodam antes, e elas montariam timelines e pins que depois precisariam ser
 * desfeitos — deixando transform e `position: fixed` para trás. No servidor
 * não há mídia para consultar, então lá o padrão é "sem redução"; isso não
 * gera divergência de hidratação porque a preferência só afeta efeitos, nunca
 * o HTML.
 */
export function useReducedMotion() {
  const [reduzido, setReduzido] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const aplicar = () => setReduzido(mq.matches);
    aplicar();
    mq.addEventListener('change', aplicar);
    return () => mq.removeEventListener('change', aplicar);
  }, []);

  return reduzido;
}
