/**
 * Registro de eventos já emitidos nesta pageview.
 *
 * Vive fora do React de propósito: é lógica pura, e é o que sustenta a
 * garantia de que um marco narrativo não infla. Cenas com scrub disparam o
 * callback de entrada toda vez que a pessoa rola para cima e volta.
 */
export function criarRegistroDeEventos() {
  const vistos = new Set();

  return {
    /**
     * @param {string} chave
     * @returns {boolean} `true` na primeira vez, `false` nas seguintes
     */
    registrar(chave) {
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    },
    /** Quantos eventos distintos já passaram. Existe para os testes. */
    get tamanho() {
      return vistos.size;
    },
  };
}
