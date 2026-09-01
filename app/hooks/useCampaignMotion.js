import {useCallback} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';

export {useCampaignMotion};

/**
 * Eventos próprios da campanha.
 *
 * Publicados como eventos customizados no barramento do Hydrogen, ao lado dos
 * nativos — nunca no lugar deles. Preço, produto e checkout continuam saindo
 * pelos eventos oficiais do Shopify.
 *
 * Nada aqui carrega o que a pessoa digitou: o nome e o número da camisa são
 * dado do pedido, não do funil.
 */
export function useCampaignAnalytics() {
  const {publish} = useAnalytics() ?? {};
  const {registrarEvento} = useCampaignMotion();

  /** Publica sempre. Use só para eventos que podem legitimamente repetir. */
  const evento = useCallback(
    (nome, dados) => {
      if (typeof publish !== 'function') return;
      publish(`custom_${nome}`, dados ?? {});
    },
    [publish],
  );

  /**
   * Publica no máximo uma vez por pageview para a chave dada.
   *
   * A chave é o que separa "marco" de "interação": `campaign_product_reveal`
   * usa o próprio nome e acontece uma vez só; `campaign_size_select:GG` usa a
   * escolha, então trocar de tamanho conta de novo mas voltar ao mesmo não.
   *
   * @param {string} nome
   * @param {string} chave
   * @param {object} [dados]
   */
  const publicarUmaVez = useCallback(
    (nome, chave, dados) => {
      if (!registrarEvento(chave)) return false;
      evento(nome, dados);
      return true;
    },
    [evento, registrarEvento],
  );

  /** Marco de cena, uma vez por pageview mesmo com scrub de ida e volta. */
  const cenaVista = useCallback(
    (cena) =>
      publicarUmaVez('campaign_scene_viewed', `campaign_scene_viewed:${cena}`, {
        scene: cena,
      }),
    [publicarUmaVez],
  );

  return {evento, publicarUmaVez, cenaVista};
}
