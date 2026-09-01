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

/**
 * Alça de QA: permite pular direto para o meio de uma cena pinada
 * (`__ST.getById('reveal')`) em vez de adivinhar coordenadas de rolagem, que
 * as próprias cenas pinadas deslocam.
 *
 * Em desenvolvimento fica sempre ligada. Em produção só com `?qa=1` na URL,
 * porque o pacote de capturas precisa rodar contra o build de produção — é
 * nele que o comportamento real acontece. São referências somente leitura
 * para a biblioteca de animação; não expõem dado da loja nem da pessoa.
 */
if (typeof window !== 'undefined') {
  const qa =
    import.meta.env?.DEV || window.location?.search?.includes('qa=1');
  if (qa) window.__ST = ScrollTrigger;
}

export {gsap, ScrollTrigger, useGSAP};
