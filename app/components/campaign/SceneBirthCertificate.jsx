import {useRef} from 'react';
import {gsap, ScrollTrigger, useGSAP} from '~/lib/gsap';
import {CERTIDAO} from '~/lib/campaign-copy';
import {MOTION, CENAS} from '~/lib/campaign-motion';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';
import {useCampaignAnalytics} from '~/hooks/useCampaignMotion';

/**
 * Capítulo 04 — certidão de nascimento do clube.
 *
 * O único bloco claro da página, e ele é obrigatório: se tudo for verde-noite
 * e ouro, a leitura escorrega para "marca financeira do agro". O papel traz
 * moda, documento e nascimento.
 *
 * A seção inteira é o documento — nada de card branco com sombra por cima de
 * um fundo escuro. E ela avisa o header, por `data-tema` no <html>, que o
 * cromo precisa inverter enquanto estiver na tela.
 */
export function SceneBirthCertificate() {
  const raiz = useRef(null);
  const {ativo, pronto, assinarScroll} = useCampaignMotion();
  const {cenaVista} = useCampaignAnalytics();

  useGSAP(
    () => {
      // O tema do header inverte mesmo em movimento reduzido: é legibilidade,
      // não enfeite.
      //
      // A pergunta é simples — "a folha clara está atrás do header agora?" — e
      // a resposta tem que valer a qualquer momento, inclusive depois de um
      // salto de rolagem. IntersectionObserver responde por evento e pode
      // deixar o tema preso quando o salto pula as fronteiras; ScrollTrigger
      // depende de coordenadas que as cenas pinadas acima deslocam. Uma
      // medição por scroll, de um elemento só, é o que não erra.
      const secao = raiz.current;
      let tema = null;
      const desassinar = assinarScroll(() => {
        const r = secao.getBoundingClientRect();
        const claro = r.top <= 72 && r.bottom > 72;
        const novo = claro ? 'papel' : 'noite';
        if (novo === tema) return;
        tema = novo;
        document.documentElement.dataset.tema = novo;
        if (claro) cenaVista(CENAS.certidao);
      });

      const limparTema = () => {
        desassinar();
        delete document.documentElement.dataset.tema;
      };

      if (!ativo) return limparTema;

      // O CSS esconde a linha com translateY(108%), mas o GSAP converte esse
      // percentual em pixels e o guarda no canal `y` — que soma com o
      // `yPercent` das timelines abaixo. Normalizar aqui deixa a máscara num
      // canal só, senão a linha aparece na saída em vez da entrada.
      gsap.set('.mask-interna', {yPercent: 108, y: 0});

      const tl = gsap.timeline({
        scrollTrigger: {
          id: CENAS.certidao,
          trigger: raiz.current,
          start: 'top 88%',
          end: 'bottom 60%',
          scrub: MOTION.scrub.narrative,
        },
      });

      tl.to('[data-cert-titulo] .mask-interna', {yPercent: 0, duration: 0.2, stagger: 0.08}, 0.1)
        .to('[data-cert-paragrafo]', {opacity: 1, y: 0, duration: 0.26}, 0.26)
        .fromTo('[data-cert-ano]', {opacity: 0, xPercent: 4}, {opacity: 0.08, xPercent: 0, duration: 0.3}, 0.42)
        .to('[data-cert-linha]', {opacity: 1, y: 0, duration: 0.3, stagger: 0.07}, 0.56)
        .to('[data-cert-ano]', {xPercent: -4, duration: 0.14}, 0.86);

      return () => {
        ScrollTrigger.getById(CENAS.certidao)?.kill();
        limparTema();
      };
    },
    {scope: raiz, dependencies: [ativo, pronto, assinarScroll], revertOnUpdate: true},
  );

  return (
    <section className="cena-certidao" ref={raiz} aria-labelledby="cert-titulo">
      <p className="certidao-ano" data-cert-ano="" aria-hidden="true">
        {CERTIDAO.marcaDagua}
      </p>

      <div className="env certidao-grade">
        <h2 className="d2 mask certidao-titulo" id="cert-titulo" data-cert-titulo="">
          {CERTIDAO.titulo.map((linha) => (
            <span className="mask-linha" key={linha}>
              <span className="mask-interna">{linha}</span>
            </span>
          ))}
        </h2>

        <div className="certidao-corpo">
          <p className="serif-lead" data-cert-paragrafo="" data-surge="">
            {CERTIDAO.paragrafo}
          </p>

          <dl className="certidao-ficha">
            {CERTIDAO.ficha.map((item) => (
              <div key={item.rotulo} data-cert-linha="" data-surge="">
                <dt>{item.rotulo}</dt>
                <dd>{item.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
