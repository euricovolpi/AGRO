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
 * `registerPlugin` é seguro no servidor: o GSAP detecta a ausência de window e
 * adia a inicialização real para o cliente.
 */
gsap.registerPlugin(ScrollTrigger, useGSAP);

// Só em desenvolvimento: dá ao QA um jeito de pular direto para o meio de uma
// cena pinada (`__ST.getById('reveal')`) sem adivinhar coordenadas de scroll.
if (import.meta.env?.DEV && typeof window !== 'undefined') {
  window.__ST = ScrollTrigger;
}

export {gsap, ScrollTrigger, useGSAP};
