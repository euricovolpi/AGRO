import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Sequência de imagens para o turntable do produto (§7, cap. 07).
 *
 * A sequência final (72 frames com alpha) ainda não existe no repositório.
 * Em vez de fingir um 360 deformando frente e costas, o hook sonda o frame
 * 000: se ele responde, a cena roda com a sequência real; se não, devolve
 * `disponivel: false` e a cena assume o fallback declarado de duas faces.
 * Basta soltar os arquivos em `public/manto/turntable/` para virar a chave,
 * sem tocar no componente.
 *
 * Regras que o desenho respeita: nunca deixar o canvas vazio (o frame 000
 * pinta assim que chega), redesenhar só quando o índice muda, e limitar o DPR
 * a 2 — acima disso o custo por frame cresce sem ganho visível.
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
          quadros.current.set(i, recurso);
          resolve(recurso);
        };
        img.onerror = reject;
        img.src = caminho(i);
      }),
    [caminho],
  );

  useEffect(() => {
    if (!ativo) return undefined;
    let vivo = true;

    async function sondar() {
      try {
        await carregar(0);
      } catch {
        if (vivo) setDisponivel(false);
        return;
      }
      if (!vivo) return;
      setDisponivel(true);
      setPronto(true);

      // Lote inicial: o suficiente para o começo do giro não engasgar.
      const inicial = [];
      for (let i = 1; i <= 11 && i < total; i++) inicial.push(carregar(i).catch(() => {}));
      await Promise.all(inicial);

      // O resto entra na folga do navegador.
      const ocioso =
        typeof requestIdleCallback === 'function'
          ? requestIdleCallback
          : (fn) => setTimeout(fn, 200);

      let i = 12;
      function proxima() {
        if (!vivo || i >= total) return;
        const lote = [];
        for (let k = 0; k < 6 && i < total; k++, i++) {
          lote.push(carregar(i).catch(() => {}));
        }
        Promise.all(lote).then(() => ocioso(proxima));
      }
      ocioso(proxima);
    }

    sondar();
    return () => {
      vivo = false;
    };
  }, [ativo, carregar, total]);

  /**
   * Desenha o frame no canvas. Ignora chamadas que não mudam o índice.
   * @param {HTMLCanvasElement | null} canvas
   * @param {number} indice
   */
  const desenhar = useCallback(
    (canvas, indice) => {
      if (!canvas) return;
      const i = Math.max(0, Math.min(total - 1, Math.round(indice)));
      if (i === ultimo.current) return;

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
      if (canvas.width !== Math.round(largura * dpr)) {
        canvas.width = Math.round(largura * dpr);
        canvas.height = Math.round(altura * dpr);
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const rw = recurso.width;
      const rh = recurso.height;
      const escala = Math.min(canvas.width / rw, canvas.height / rh);
      const w = rw * escala;
      const h = rh * escala;
      ctx.drawImage(recurso, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    },
    [carregar, total],
  );

  return {disponivel, pronto, desenhar, total};
}
