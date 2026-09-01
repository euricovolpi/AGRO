import {describe, expect, it} from 'vitest';
import {
  PONTOS,
  caminhoInterpolado,
  geometriaCampo,
} from '../../app/lib/campaign-field';

/** Extrai os pares numéricos de um atributo `d` de polilinha. */
function pontos(d) {
  return d
    .split(/[ML]/)
    .filter(Boolean)
    .map((par) => par.trim().split(' ').map(Number));
}

describe('transformação lavoura → campo', () => {
  it('emparelha cada linha ponto a ponto — é o que permite interpolar', () => {
    const {linhas} = geometriaCampo();
    expect(linhas.length).toBeGreaterThan(15);
    linhas.forEach((l) => {
      expect(l.de).toHaveLength(PONTOS);
      expect(l.para).toHaveLength(PONTOS);
    });
  });

  it('é determinística — servidor e cliente desenham a mesma lavoura', () => {
    const a = geometriaCampo();
    const b = geometriaCampo();
    expect(caminhoInterpolado(a.linhas[0], 0)).toBe(
      caminhoInterpolado(b.linhas[0], 0),
    );
  });

  it('em 0 é lavoura, em 1 é campo, e o meio fica entre os dois', () => {
    const {linhas} = geometriaCampo();
    const linha = linhas[0];
    const inicio = pontos(caminhoInterpolado(linha, 0));
    const meio = pontos(caminhoInterpolado(linha, 0.5));
    const fim = pontos(caminhoInterpolado(linha, 1));

    expect(inicio[0][0]).toBeCloseTo(linha.de[0][0], 0);
    expect(fim[0][0]).toBeCloseTo(linha.para[0][0], 0);

    const entre = (m, a, b) => m >= Math.min(a, b) - 0.6 && m <= Math.max(a, b) + 0.6;
    meio.forEach(([x, y], i) => {
      expect(entre(x, linha.de[i][0], linha.para[i][0])).toBe(true);
      expect(entre(y, linha.de[i][1], linha.para[i][1])).toBe(true);
    });
  });

  it('mobile usa menos paths e orientação vertical', () => {
    const vertical = geometriaCampo({vertical: true, total: 15});
    expect(vertical.linhas).toHaveLength(15);
    expect(vertical.viewBox).toBe('0 0 900 1600');
  });

  it('cada linha muda de forma — nenhuma fica parada fingindo crossfade', () => {
    const {linhas} = geometriaCampo();
    linhas.forEach((l) => {
      const deslocou = l.de.some(
        ([x, y], i) =>
          Math.abs(x - l.para[i][0]) > 1 || Math.abs(y - l.para[i][1]) > 1,
      );
      expect(deslocou).toBe(true);
    });
  });
});
