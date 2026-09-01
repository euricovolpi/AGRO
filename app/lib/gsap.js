import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {useGSAP} from '@gsap/react';

/**
 * Registro único do GSAP.
 *
 * Precisa acontecer no momento do import, não dentro de um efeito: no React,
 * os efeitos dos filhos rodam antes dos do pai, então uma cena criaria o seu
 * ScrollTrigger antes de o provider ter registrado o plugin — e a criação
 * falha. Importando daqui, qualquer cena que use ScrollTrigger já o encontra
 * registrado.
 *
 * `useGSAP` NÃO entra aqui, embora a documentação do GSAP registre os dois
 * juntos. Registrá-lo derruba o runtime de Workers do Oxygen: o worker morre
 * na inicialização, antes de responder qualquer requisição. O registro é
 * opcional — serve só para impedir que bundlers removam o hook por
 * tree-shaking, e aqui ele é importado e chamado diretamente pelas cenas.
 *
 * A quebra é silenciosa e cara de achar: `npm run build` passa, o dev server
 * funciona e o `hydrogen deploy` sai com código 0 depois de ficar preso em
 * "Verifying deployment has been completed". Quem denuncia é
 * `npx shopify hydrogen preview`, que roda o bundle de produção no mesmo
 * workerd do Oxygen — rode isso antes de todo deploy.
 */
gsap.registerPlugin(ScrollTrigger);

// Só em desenvolvimento: dá ao QA um jeito de pular direto para o meio de uma
// cena pinada (`__ST.getById('reveal')`) sem adivinhar coordenadas de scroll.
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__ST = ScrollTrigger;
}

export {gsap, ScrollTrigger, useGSAP};
