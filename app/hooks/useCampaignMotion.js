import {useCallback} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';

export {useCampaignMotion};

/**
 * Eventos próprios da campanha (§18 da spec).
 *
 * Publicados como eventos customizados no barramento do Hydrogen, ao lado dos
 * nativos — nunca no lugar deles. Preço, produto e checkout continuam saindo
 * pelos eventos oficiais do Shopify.
 *
 * Cada cena dispara no máximo uma vez por pageview: o controle é do provider,
 * porque durante um scrub o callback de entrada roda a cada ida e volta.
 */
export function useCampaignAnalytics() {
  const {publish} = useAnalytics() ?? {};
  const {registrarCena} = useCampaignMotion();

  const evento = useCallback(
    (nome, dados) => {
      if (typeof publish !== 'function') return;
      publish(`custom_${nome}`, dados ?? {});
    },
    [publish],
  );

  const cenaVista = useCallback(
    (cena) => {
      if (!registrarCena(cena)) return;
      evento('campaign_scene_viewed', {scene: cena});
    },
    [evento, registrarCena],
  );

  return {evento, cenaVista};
}
