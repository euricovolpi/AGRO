import {HydratedRouter} from 'react-router/dom';
import {startTransition, StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {NonceProvider} from '@shopify/hydrogen';

/**
 * Cancela o watchdog do boot assim que este arquivo executa.
 *
 * A pergunta do watchdog é "o bundle chegou e está rodando?", e a resposta já
 * é sim aqui. Amarrá-la ao fim da hidratação era responder tarde demais: num
 * aparelho quatro vezes mais lento que um desktop, hidratar leva mais que os
 * 2,5 s do prazo, e a página caía em fail-open justamente onde o movimento
 * funcionaria — com o layout encolhido e os pins nascendo por cima.
 */
window.__agroBootOk?.();

if (!window.location.origin.includes('webcache.googleusercontent.com')) {
  startTransition(() => {
    // Extract nonce from existing script tags
    const existingNonce = document.querySelector('script[nonce]')?.nonce;

    hydrateRoot(
      document,
      <StrictMode>
        <NonceProvider value={existingNonce}>
          <HydratedRouter />
        </NonceProvider>
      </StrictMode>,
    );
  });
}
