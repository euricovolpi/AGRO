import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Sequência de imagens para o turntable do produto.
 *
 * A sequência final (72 frames com alpha) ainda não existe no repositório.
 * Em vez de fingir um giro deformando frente e costas, o hook sonda o frame
 * 000: se ele responde, a cena roda com a sequência real; se não, devolve
 * `disponivel: false` e a cena assume o fallback declarado de duas faces.
 * Basta soltar os arquivos em `public/manto/turntable/` para virar a chave,
 * sem tocar no componente.
 *
 * Ciclo de vida, que é o que separa isto de um preloader ingênuo:
 *
 * - o frame 000 carrega já, para o canvas nunca aparecer vazio;
 * - o resto só começa quando a cena está perto da viewport (`preparar`), senão
 *   a página gasta banda no topo com imagens do meio do documento;
 * - os lotes seguintes entram na folga do navegador e são cancelados no
 *   unmount;
 * - todo `ImageBitmap` é fechado ao sair — são 72 decodificações que o
 *   coletor de lixo não recupera sozinho.
 *
 * @param {{base?: string; total?: number; ativo?: boolean}} [opcoes]
 */
export function useImageSequence({
  base = '/manto/turntable/manto-',
  total = 72,
  ativo = true,
} = {}) {
  const [disponivel, setDisponivel] = useState(null); // null = sondando
  const [pronto, setPronto] = useState(false);
  const quadros = useRef(new Map());
  const ultimo = useRef(-1);
  const vivoRef = useRef(true);
  const idlesRef = useRef(new Set());
  const preparadoRef = useRef(false);

  const caminho = useCallback(
    (i) => `${base}${String(i).padStart(3, '0')}.webp`,
    [base],
  );

  const carregar = useCallback(
    (i) =>
      new Promise((resolve, reject) => {
        if (quadros.current.has(i)) {
          resolve(quadros.current.get(i));
          return;
        }
        const img = new Image();
        img.decoding = 'async';
        img.onload = async () => {
          let recurso = img;
          // ImageBitmap tira a decodificação do caminho crítico do desenho.
          if (typeof createImageBitmap === 'function') {
            try {
              recurso = await createImageBitmap(img);
            } catch {
              recurso = img;
            }
          }
          if (!vivoRef.current) {
            recurso.close?.();
            reject(new Error('desmontado'));
            return;
          }
          quadros.current.set(i, recurso);
          resolve(recurso);
        };
        img.onerror = reject;
        img.src = caminho(i);
      }),
    [caminho],
  );

  const agendarOcioso = useCallback((fn) => {
    const id =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback(fn)
        : setTimeout(fn, 200);
    idlesRef.current.add(id);
    return id;
  }, []);

  // Sonda só o frame 000: barato, e responde a única pergunta que decide entre
  // a sequência real e o fallback.
  useEffect(() => {
    if (!ativo) return undefined;
    vivoRef.current = true;

    carregar(0)
      .then(() => {
        if (!vivoRef.current) return;
        setDisponivel(true);
        setPronto(true);
      })
      .catch(() => {
        if (vivoRef.current) setDisponivel(false);
      });

    return () => {
      vivoRef.current = false;
    };
  }, [ativo, carregar]);

  /**
   * Libera o carregamento do restante da sequência. A cena chama isto quando
   * está perto de entrar em tela — nunca no carregamento da página.
   */
  const preparar = useCallback(() => {
    if (preparadoRef.current || disponivel !== true) return;
    preparadoRef.current = true;

    let i = 1;
    function proximoLote() {
      if (!vivoRef.current || i >= total) return;
      const lote = [];
      for (let k = 0; k < 6 && i < total; k++, i++) {
        lote.push(carregar(i).catch(() => {}));
      }
      Promise.all(lote).then(() => {
        if (vivoRef.current) agendarOcioso(proximoLote);
      });
    }
    proximoLote();
  }, [agendarOcioso, carregar, disponivel, total]);

  // Fecha bitmaps e cancela trabalho pendente ao sair da rota.
  useEffect(
    () => () => {
      vivoRef.current = false;
      idlesRef.current.forEach((id) => {
        if (typeof cancelIdleCallback === 'function') cancelIdleCallback(id);
        clearTimeout(id);
      });
      idlesRef.current.clear();
      quadros.current.forEach((recurso) => recurso.close?.());
      quadros.current.clear();
      ultimo.current = -1;
      preparadoRef.current = false;
    },
    [],
  );

  /**
   * Desenha o frame no canvas. Ignora chamadas que não mudam nada.
   * @param {HTMLCanvasElement | null} canvas
   * @param {number} indice
   * @param {{forcar?: boolean}} [opcoes] `forcar` redesenha o frame atual,
   *   usado quando o canvas muda de tamanho
   */
  const desenhar = useCallback(
    (canvas, indice, {forcar = false} = {}) => {
      if (!canvas) return;
      const i = Math.max(0, Math.min(total - 1, Math.round(indice)));
      if (i === ultimo.current && !forcar) return;

      // Enquanto o frame exato não chegou, segura o anterior — nunca limpa a
      // tela para "esperar", que é o que cria o piscar branco.
      const recurso = quadros.current.get(i);
      if (!recurso) {
        if (!quadros.current.has(i)) carregar(i).catch(() => {});
        return;
      }

      ultimo.current = i;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const largura = canvas.clientWidth;
      const altura = canvas.clientHeight;
      if (!largura || !altura) return;

      const w = Math.round(largura * dpr);
      const h = Math.round(altura * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const escala = Math.min(canvas.width / recurso.width, canvas.height / recurso.height);
      const dw = recurso.width * escala;
      const dh = recurso.height * escala;
      ctx.drawImage(recurso, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
    },
    [carregar, total],
  );

  /** Redesenha o frame atual — para o `ResizeObserver` do canvas. */
  const redesenhar = useCallback(
    (canvas) => {
      if (ultimo.current < 0) return;
      desenhar(canvas, ultimo.current, {forcar: true});
    },
    [desenhar],
  );

  return {disponivel, pronto, desenhar, redesenhar, preparar, total};
}
