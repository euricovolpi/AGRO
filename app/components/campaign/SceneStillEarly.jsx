import {useRef} from 'react';
import {gsap, ScrollTrigger, useGSAP} from '~/lib/gsap';
import {AINDA} from '~/lib/campaign-copy';
import {MOTION, CENAS, alturaCena} from '~/lib/campaign-motion';
import {useCampaignMotion} from '~/components/campaign/CampaignMotionProvider';
import {useCampaignAnalytics} from '~/hooks/useCampaignMotion';

const ENSAIO = [
  {
    imagem: '/manto/atmosfera.webp',
    largura: 1600,
    altura: 892,
    alt: 'Poeira dourada suspensa contra o escuro, ao entardecer',
    movimento: 'zoom',
  },
  {
    imagem: '/manto/campo.webp',
    largura: 585,
    altura: 438,
    alt: 'Elenco em treino no campo do clube, em Catalão',
    movimento: 'pan',
  },
  {
    imagem: '/manto/torcida.webp',
    largura: 1200,
    altura: 1131,
    alt: 'Torcedores comemorando na arquibancada com o cachecol do clube',
    movimento: 'clip',
  },
  {
    imagem: '/manto/produtor.webp',
    largura: 1045,
    altura: 1400,
    alt: 'Produtor rural de costas usando o manto diante da lavoura',
    movimento: 'parallax',
  },
];

/**
 * Capítulo 09 — "Você chegou no começo" e a cena "AINDA.".
 *
 * O argumento da campanha inteira mora aqui: a ausência de história não é
 * defeito a esconder, é a razão de a peça existir agora. Por isso as três
 * negações vêm antes — e só depois a palavra que as vira do avesso.
 *
 * "AINDA." é o maior silêncio da página. Nenhum botão, logo, ticker ou imagem
 * divide a tela com ela.
 */
export function SceneStillEarly() {
  const raiz = useRef(null);
  const {ativo} = useCampaignMotion();
  const {cenaVista} = useCampaignAnalytics();

  useGSAP(
    () => {
      if (!ativo) return;

      // O CSS esconde a linha com translateY(108%), mas o GSAP converte esse
      // percentual em pixels e o guarda no canal `y` — que soma com o
      // `yPercent` das timelines abaixo. Normalizar aqui deixa a máscara num
      // canal só, senão a linha aparece na saída em vez da entrada.
      gsap.set('.mask-interna', {yPercent: 108, y: 0});

      // Ensaio fotográfico: cada imagem tem um movimento próprio, curto.
      const blocos = gsap.utils.toArray('[data-ensaio]');
      const tweens = blocos.map((bloco) => {
        const img = bloco.querySelector('img');
        const copy = bloco.querySelectorAll('.mask-interna');
        const modo = bloco.dataset.movimento;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: bloco,
            start: 'top 88%',
            end: 'bottom 42%',
            scrub: MOTION.scrub.ambient,
          },
        });

        if (modo === 'zoom') tl.fromTo(img, {scale: 1.12}, {scale: 1, ease: 'none', duration: 1}, 0);
        if (modo === 'pan') tl.fromTo(img, {xPercent: -3}, {xPercent: 3, ease: 'none', duration: 1}, 0);
        if (modo === 'clip')
          tl.fromTo(
            bloco.querySelector('[data-ensaio-figura]'),
            {clipPath: 'inset(0 100% 0 0)'},
            {clipPath: 'inset(0 0% 0 0)', duration: 0.4},
            0,
          );
        if (modo === 'parallax') tl.fromTo(img, {yPercent: -3}, {yPercent: 3, ease: 'none', duration: 1}, 0);

        tl.to(copy, {yPercent: 0, duration: 0.3, stagger: 0.08}, 0.1);
        return tl;
      });

      // A cena da palavra: entra, segura imóvel, recebe um filete de ouro no
      // ponto final e sai. Nada mais.
      const tlAinda = gsap.timeline({
        scrollTrigger: {
          id: CENAS.ainda,
          trigger: '[data-ainda]',
          start: 'top top',
          end: alturaCena('ainda'),
          pin: '[data-ainda-palco]',
          scrub: MOTION.scrub.narrative,
          onEnter: () => cenaVista(CENAS.ainda),
          // A cena da palavra é o maior silêncio da página: enquanto ela está
          // em tela, header e barra de compra saem de cena.
          onToggle: ({isActive}) => {
            document.documentElement.dataset.silencio = isActive ? '1' : '';
          },
        },
      });

      tlAinda
        .fromTo('[data-ainda-palavra]', {yPercent: 100}, {yPercent: 0, duration: 0.24}, 0)
        .fromTo('[data-ainda-filete]', {scaleX: 0, opacity: 0}, {scaleX: 1, opacity: 1, duration: 0.1}, 0.72)
        .to('[data-ainda-filete]', {opacity: 0, duration: 0.06}, 0.86)
        .to('[data-ainda-palavra]', {opacity: 0, scale: 0.985, duration: 0.12}, 0.88);

      return () => {
        tweens.forEach((t) => t.scrollTrigger?.kill());
        ScrollTrigger.getById(CENAS.ainda)?.kill();
        delete document.documentElement.dataset.silencio;
      };
    },
    {scope: raiz, dependencies: [ativo], revertOnUpdate: true},
  );

  return (
    <section className="cena-ainda-bloco" ref={raiz} aria-labelledby="ainda-titulo">
      <div className="env">
        <h2 className="d2 mask ainda-abertura" id="ainda-titulo">
          <span className="mask-linha">
            <span className="mask-interna">{AINDA.abertura}</span>
          </span>
        </h2>
      </div>

      <div className="ensaio">
        {AINDA.negacoes.map((linhas, i) => {
          const foto = ENSAIO[i];
          return (
            <article
              className={`ensaio-bloco${i % 2 ? ' invertido' : ''}`}
              key={linhas.join('-')}
              data-ensaio=""
              data-movimento={foto.movimento}
            >
              <figure className="ensaio-figura" data-ensaio-figura="">
                <img
                  src={foto.imagem}
                  width={foto.largura}
                  height={foto.altura}
                  alt={foto.alt}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
              <p className="d3 mask ensaio-copy">
                {linhas.map((linha) => (
                  <span className="mask-linha" key={linha}>
                    <span className="mask-interna">{linha}</span>
                  </span>
                ))}
              </p>
            </article>
          );
        })}
      </div>

      <div className="cena cena-ainda" data-ainda="">
        <div className="cena-palco ainda-palco" data-ainda-palco="">
          <p className="ainda-palavra" data-ainda-palavra="">
            {AINDA.palavra}
            <i className="ainda-filete" data-ainda-filete="" aria-hidden="true" />
          </p>
        </div>
      </div>

      <div className="env ainda-fecho">
        <article
          className="ensaio-bloco ensaio-fecho"
          data-ensaio=""
          data-movimento="zoom"
        >
          <figure className="ensaio-figura" data-ensaio-figura="">
            <img
              src={ENSAIO[3].imagem}
              width={ENSAIO[3].largura}
              height={ENSAIO[3].altura}
              alt={ENSAIO[3].alt}
              loading="lazy"
              decoding="async"
            />
          </figure>
          <p className="d3 mask ensaio-copy">
            {AINDA.fechamento.map((linha) => (
              <span className="mask-linha" key={linha}>
                <span className="mask-interna">{linha}</span>
              </span>
            ))}
          </p>
        </article>
      </div>
    </section>
  );
}
