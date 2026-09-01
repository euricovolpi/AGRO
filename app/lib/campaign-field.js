/**
 * Geometria do capítulo 03 — "Do campo para o campo".
 *
 * A cena não é um crossfade entre uma foto de lavoura e um ícone de campo: as
 * mesmas linhas que desenham as ruas da plantação se reorganizam até virar as
 * marcações de um campo de futebol. Para isso cada linha precisa ter a mesma
 * quantidade de pontos na forma inicial e na forma-alvo — daí todo path aqui
 * ser amostrado em `PONTOS` posições.
 *
 * Nada de Math.random: a irregularidade do terreno é derivada do índice da
 * linha, senão servidor e cliente desenham plantações diferentes.
 */

export const PONTOS = 26;

/** Ruído determinístico em [-1, 1] a partir de dois inteiros. */
function ruido(a, b) {
  const n = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Amostra `PONTOS` posições ao longo de uma polilinha. */
function amostrarPolilinha(vertices) {
  const distancias = [0];
  let total = 0;
  for (let i = 1; i < vertices.length; i++) {
    const [x0, y0] = vertices[i - 1];
    const [x1, y1] = vertices[i];
    total += Math.hypot(x1 - x0, y1 - y0);
    distancias.push(total);
  }

  const saida = [];
  for (let i = 0; i < PONTOS; i++) {
    const alvo = (total * i) / (PONTOS - 1);
    let seg = 1;
    while (seg < distancias.length - 1 && distancias[seg] < alvo) seg++;
    const d0 = distancias[seg - 1];
    const d1 = distancias[seg];
    const t = d1 === d0 ? 0 : (alvo - d0) / (d1 - d0);
    const [x0, y0] = vertices[seg - 1];
    const [x1, y1] = vertices[seg];
    saida.push([lerp(x0, x1, t), lerp(y0, y1, t)]);
  }
  return saida;
}

/** Amostra `PONTOS` posições ao longo de um arco de círculo. */
function amostrarArco(cx, cy, r, ang0, ang1) {
  const saida = [];
  for (let i = 0; i < PONTOS; i++) {
    const a = lerp(ang0, ang1, i / (PONTOS - 1));
    saida.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return saida;
}

/**
 * Marcações do campo, em ordem de importância narrativa: primeiro o contorno,
 * depois o meio, depois o círculo, e por fim as áreas. Mobile corta a cauda
 * dessa lista, então a ordem também é a regra de simplificação.
 * @param {{w: number; h: number; vertical: boolean}} caixa
 */
function marcacoes({w, h, vertical}) {
  const margemX = vertical ? w * 0.14 : w * 0.115;
  const margemY = vertical ? h * 0.19 : h * 0.21;
  const x0 = margemX;
  const x1 = w - margemX;
  const y0 = margemY;
  const y1 = h - margemY;
  const cx = w / 2;
  const cy = h / 2;
  const raio = vertical ? (x1 - x0) * 0.19 : (y1 - y0) * 0.19;

  const lista = [];

  // Contorno externo
  lista.push(amostrarPolilinha([[x0, y0], [x1, y0]]));
  lista.push(amostrarPolilinha([[x0, y1], [x1, y1]]));
  lista.push(amostrarPolilinha([[x0, y0], [x0, y1]]));
  lista.push(amostrarPolilinha([[x1, y0], [x1, y1]]));

  // Meio-campo
  lista.push(
    vertical
      ? amostrarPolilinha([[x0, cy], [x1, cy]])
      : amostrarPolilinha([[cx, y0], [cx, y1]]),
  );

  // Círculo central em quatro arcos — assim ele é desenhado, não colado
  const q = Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    lista.push(amostrarArco(cx, cy, raio, i * q, (i + 1) * q));
  }

  /**
   * Cada lado de uma área vira um path próprio, e não um retângulo aberto.
   * São mais linhas para reorganizar — e é disso que a cena vive: a spec pede
   * de 18 a 24 sulcos no desktop, e um path por área daria 13.
   */
  function area(borda, meio, transversal0, transversal1, horizontal) {
    if (horizontal) {
      lista.push(amostrarPolilinha([[borda, transversal0], [meio, transversal0]]));
      lista.push(amostrarPolilinha([[meio, transversal0], [meio, transversal1]]));
      lista.push(amostrarPolilinha([[meio, transversal1], [borda, transversal1]]));
    } else {
      lista.push(amostrarPolilinha([[transversal0, borda], [transversal0, meio]]));
      lista.push(amostrarPolilinha([[transversal0, meio], [transversal1, meio]]));
      lista.push(amostrarPolilinha([[transversal1, meio], [transversal1, borda]]));
    }
  }

  if (vertical) {
    const larguraArea = (x1 - x0) * 0.55;
    const profundidade = (y1 - y0) * 0.14;
    area(y0, y0 + profundidade, cx - larguraArea / 2, cx + larguraArea / 2, false);
    area(y1, y1 - profundidade, cx - larguraArea / 2, cx + larguraArea / 2, false);

    const larguraGol = larguraArea * 0.5;
    const profGol = profundidade * 0.45;
    area(y0, y0 + profGol, cx - larguraGol / 2, cx + larguraGol / 2, false);
    area(y1, y1 - profGol, cx - larguraGol / 2, cx + larguraGol / 2, false);
  } else {
    const alturaArea = (y1 - y0) * 0.55;
    const profundidade = (x1 - x0) * 0.14;
    area(x0, x0 + profundidade, cy - alturaArea / 2, cy + alturaArea / 2, true);
    area(x1, x1 - profundidade, cy - alturaArea / 2, cy + alturaArea / 2, true);

    const alturaGol = alturaArea * 0.5;
    const profGol = profundidade * 0.45;
    area(x0, x0 + profGol, cy - alturaGol / 2, cy + alturaGol / 2, true);
    area(x1, x1 - profGol, cy - alturaGol / 2, cy + alturaGol / 2, true);
  }

  return lista;
}

/**
 * Ruas da plantação vistas de cima, em perspectiva: convergem para um ponto
 * de fuga acima da moldura. A leve ondulação por linha impede o resultado de
 * parecer papel milimetrado.
 * @param {{w: number; h: number; total: number}} caixa
 */
function lavoura({w, h, total}) {
  const fugaX = w / 2;
  const fugaY = -h * 0.55;
  const lista = [];

  for (let i = 0; i < total; i++) {
    const t = total === 1 ? 0.5 : i / (total - 1);
    // Espalha mais nas bordas: sulcos do centro ficam próximos, como em um
    // sobrevoo real.
    const espalho = (t - 0.5) * 2;
    const baseX = fugaX + espalho * w * 0.92 + ruido(i, 3) * w * 0.012;
    const topoX = fugaX + espalho * w * 0.16 + ruido(i, 7) * w * 0.006;

    const pontos = [];
    for (let p = 0; p < PONTOS; p++) {
      const k = p / (PONTOS - 1);
      const x = lerp(baseX, topoX, k);
      const y = lerp(h * 1.06, fugaY + h * 0.62, k);
      const onda = ruido(i, p) * w * 0.0035 * (1 - k);
      pontos.push([x + onda, y]);
    }
    lista.push(pontos);
  }

  return lista;
}

/**
 * Monta o par (lavoura → campo) já emparelhado ponto a ponto.
 * @param {{vertical?: boolean; total?: number}} [opcoes]
 */
export function geometriaCampo({vertical = false, total} = {}) {
  const w = vertical ? 900 : 1600;
  const h = vertical ? 1600 : 900;

  const alvos = marcacoes({w, h, vertical});
  const quantas = Math.min(total ?? alvos.length, alvos.length);
  const finais = alvos.slice(0, quantas);
  const iniciais = lavoura({w, h, total: quantas});

  return {
    viewBox: `0 0 ${w} ${h}`,
    linhas: finais.map((alvo, i) => ({
      id: `l${i}`,
      de: iniciais[i],
      para: alvo,
      // Escalonamento: contorno primeiro, áreas por último. Sem isso as 21
      // linhas chegam juntas e o campo aparece de uma vez, sem construção.
      inicio: 0.14 + (i / quantas) * 0.5,
      fim: 0.52 + (i / quantas) * 0.34,
    })),
  };
}

/**
 * Interpola uma linha e devolve o atributo `d`.
 * @param {{de: number[][]; para: number[][]}} linha
 * @param {number} t
 */
export function caminhoInterpolado(linha, t) {
  const k = t <= 0 ? 0 : t >= 1 ? 1 : t;
  let d = '';
  for (let i = 0; i < linha.de.length; i++) {
    const [x0, y0] = linha.de[i];
    const [x1, y1] = linha.para[i];
    const x = lerp(x0, x1, k).toFixed(1);
    const y = lerp(y0, y1, k).toFixed(1);
    d += (i === 0 ? 'M' : 'L') + x + ' ' + y;
    if (i < linha.de.length - 1) d += ' ';
  }
  return d;
}
