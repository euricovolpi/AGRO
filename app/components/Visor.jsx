import {useEffect, useRef, useState} from 'react';
import {DETALHES} from '~/lib/manto';

/**
 * O visor do manto: frente e costas no mesmo palco, giro em 3D, e marcadores
 * que abrem o macro de cada detalhe de confecção.
 *
 * Decisões que valem o comentário:
 * - As duas faces existem no DOM desde o SSR (a de trás só está rotacionada).
 *   Sem JS o usuário ainda vê a frente e lê todos os detalhes na lista.
 * - As coordenadas dos marcadores são fixas em % (lib/manto.js) — nada de
 *   medir a imagem, senão servidor e cliente discordam na hidratação.
 */
export function Visor() {
  const [face, setFace] = useState('frente');
  const [aberto, setAberto] = useState(DETALHES.frente[0].id);
  const [girando, setGirando] = useState(false);
  const timer = useRef(null);
  const palcoRef = useRef(null);

  const lista = DETALHES[face];
  const detalhe = lista.find((d) => d.id === aberto) ?? lista[0];

  useEffect(() => () => clearTimeout(timer.current), []);

  // Inclinação pelo ponteiro. Some junto com o giro: durante a virada de face
  // a classe .girando não está e a transição longa cuida do movimento.
  function inclinar(e) {
    const el = palcoRef.current;
    if (!el || girando) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!matchMedia('(hover: hover)').matches) return;
    const r = el.getBoundingClientRect();
    el.classList.add('inclinando');
    el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 10}deg`);
    el.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 7}deg`);
  }

  function endireitar() {
    const el = palcoRef.current;
    if (!el) return;
    el.classList.remove('inclinando');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--rx', '0deg');
  }

  function trocarFace(nova) {
    if (nova === face) return;
    // Zera a inclinação antes de girar: senão a peça sai torta na virada.
    endireitar();
    setFace(nova);
    setAberto(DETALHES[nova][0].id);
    setGirando(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setGirando(false), 1100);
  }

  return (
    <div className="mn-visor">
      <div
        ref={palcoRef}
        className={`mn-palco${girando ? ' girando' : ''}`}
        data-face={face}
        role="group"
        aria-label="Visualização do manto"
        onPointerMove={inclinar}
        onPointerLeave={endireitar}
      >
        <div className="mn-quadro">
          <div className="mn-pecas">
            <div className="mn-face frente">
              <img
                src="/manto/manto-frente.webp"
                width="1166"
                height="1436"
                alt="Frente do Manto I 2027: camisa verde-escura com gola em V dourada e escudo bordado"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="mn-face costas">
              <img
                src="/manto/manto-costas.webp"
                width="1231"
                height="1500"
                alt="Costas do Manto I 2027 com o número 10 dourado"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {lista.map((d, i) => (
            <button
              key={d.id}
              type="button"
              className="mn-ponto"
              style={{left: `${d.x}%`, top: `${d.y}%`}}
              aria-pressed={d.id === aberto}
              aria-label={`Ver detalhe: ${d.titulo}`}
              onClick={() => setAberto(d.id)}
            >
              {String(i + 1).padStart(2, '0')}
            </button>
          ))}
        </div>

        <div className="mn-varredura" aria-hidden="true" />

        <div className="mn-troca">
          <button
            type="button"
            aria-pressed={face === 'frente'}
            onClick={() => trocarFace('frente')}
          >
            Frente
          </button>
          <button
            type="button"
            aria-pressed={face === 'costas'}
            onClick={() => trocarFace('costas')}
          >
            Costas
          </button>
        </div>
      </div>

      <div className="mn-leitura">
        <div className="mn-leitura-macro">
          <img
            key={detalhe.id}
            src={detalhe.imagem}
            alt={detalhe.alt}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div>
          <h3 className="d4">{detalhe.titulo}</h3>
          <p>{detalhe.texto}</p>
        </div>
        <div className="mn-leitura-indice">
          {lista.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={d.id === aberto}
              onClick={() => setAberto(d.id)}
            >
              {d.titulo.split(',')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
