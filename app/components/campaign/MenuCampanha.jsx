import {useEffect, useRef} from 'react';
import {CANON} from '~/lib/campaign-copy';

const FOCAVEIS =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Menu mobile como diálogo de verdade.
 *
 * Um overlay que cobre a tela mas deixa o fundo navegável por Tab é uma
 * armadilha: quem usa teclado ou leitor de tela sai do menu sem perceber e
 * passa a operar uma página que não está vendo. Por isso aqui: `role="dialog"`
 * com `aria-modal`, foco preso enquanto aberto, fundo marcado como inerte,
 * devolução do foco ao gatilho e três formas de fechar — botão, Escape e a
 * própria escolha de um link.
 *
 * A rolagem trava com a posição preservada. `overflow: hidden` no body não
 * segura o iOS, e `position: fixed` sem guardar o deslocamento devolve a
 * pessoa ao topo da página ao fechar.
 *
 * @param {{
 *   aberto: boolean;
 *   aoFechar: () => void;
 *   links: {href: string, rotulo: string}[];
 *   gatilhoRef: {current: HTMLElement | null};
 * }}
 */
export function MenuCampanha({aberto, aoFechar, links, gatilhoRef}) {
  const painelRef = useRef(null);
  const fecharRef = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;

    const painel = painelRef.current;
    const gatilho = gatilhoRef.current;
    const raiz = document.documentElement;
    const corpo = document.body;

    const deslocamento = scrollY;
    const estilo = {
      position: corpo.style.position,
      top: corpo.style.top,
      width: corpo.style.width,
      overflow: corpo.style.overflow,
    };
    corpo.style.position = 'fixed';
    corpo.style.top = `-${deslocamento}px`;
    corpo.style.width = '100%';
    corpo.style.overflow = 'hidden';

    // O fundo inteiro sai da árvore de interação: nem Tab, nem leitor de tela.
    const inertes = [
      document.getElementById('conteudo'),
      document.querySelector('.cabecalho'),
      document.querySelector('.rodape'),
      document.querySelector('.barra-compra'),
    ].filter(Boolean);
    inertes.forEach((el) => {
      el.setAttribute('inert', '');
      el.setAttribute('aria-hidden', 'true');
    });

    fecharRef.current?.focus();

    function aoTeclar(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        aoFechar();
        return;
      }
      if (e.key !== 'Tab') return;

      const alvos = Array.from(painel?.querySelectorAll(FOCAVEIS) ?? []).filter(
        (el) => el.offsetParent !== null,
      );
      if (!alvos.length) return;

      const primeiro = alvos[0];
      const ultimo = alvos[alvos.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }

    raiz.addEventListener('keydown', aoTeclar);

    return () => {
      raiz.removeEventListener('keydown', aoTeclar);
      inertes.forEach((el) => {
        el.removeAttribute('inert');
        el.removeAttribute('aria-hidden');
      });
      corpo.style.position = estilo.position;
      corpo.style.top = estilo.top;
      corpo.style.width = estilo.width;
      corpo.style.overflow = estilo.overflow;
      scrollTo(0, deslocamento);
      gatilho?.focus();
    };
  }, [aberto, aoFechar, gatilhoRef]);

  return (
    <div
      id="menu-campanha"
      className={`menu-overlay${aberto ? ' aberto' : ''}`}
      hidden={!aberto}
      role="dialog"
      aria-modal="true"
      aria-label="Menu da campanha"
      ref={painelRef}
    >
      <button
        type="button"
        className="menu-fechar"
        onClick={aoFechar}
        ref={fecharRef}
      >
        Fechar
      </button>

      <nav aria-label="Navegação principal">
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={aoFechar}>
            {l.rotulo}
          </a>
        ))}
      </nav>

      <p className="menu-lockup">
        {CANON.clube}
        <br />
        {CANON.praca}
        <br />
        Fundado em {CANON.fundacao}
      </p>
    </div>
  );
}
