/**
 * Fumaça do build de produção.
 *
 * Sobe o `hydrogen preview` — o mesmo workerd do Oxygen —, confere que a home
 * responde 200 com a narrativa inteira no HTML servido, e derruba o servidor.
 *
 * Existe porque `npm run build` passar não prova que a loja sobe: o build
 * compila, quem executa é o runtime de Workers. Um deploy já foi perdido
 * exatamente nesse vão.
 */
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const PORTA = process.argv[2] ?? 3211;
const BASE = `http://localhost:${PORTA}`;
const CAPITULOS = [
  'Todo time tem',
  'Nascido',
  'Do campo',
  'Não herdamos uma história',
  'Um novo símbolo',
  'O primeiro uniforme',
  'Edição Fundadora',
  'Ainda.',
  'Faça parte do primeiro capítulo',
];

// Chama o entrypoint JS da CLI direto, com o próprio Node. Passar pelo `npx`
// exigiria `shell: true` no Windows — que não escapa argumentos e ainda deixa
// o filho num handle que o libuv reclama na hora de matar.
const CLI = fileURLToPath(
  new URL('../node_modules/@shopify/cli/bin/run.js', import.meta.url),
);

const servidor = spawn(
  process.execPath,
  [CLI, 'hydrogen', 'preview', '--port', String(PORTA)],
  {stdio: 'ignore'},
);

function encerrar(codigo, mensagem) {
  servidor.kill();
  if (mensagem) console.error(mensagem);
  else console.log(`preview OK em ${BASE} — ${CAPITULOS.length} capítulos no SSR`);
  process.exit(codigo);
}

const limite = Date.now() + 120_000;
let html = null;

while (Date.now() < limite) {
  await new Promise((r) => setTimeout(r, 1500));
  try {
    const r = await fetch(BASE);
    if (r.ok) {
      html = await r.text();
      break;
    }
  } catch {
    // ainda subindo
  }
}

if (!html) encerrar(1, 'O preview de produção não respondeu — worker não subiu.');

const ausentes = CAPITULOS.filter((c) => !html.includes(c));
if (ausentes.length) {
  encerrar(1, `Capítulos ausentes do HTML servido: ${ausentes.join(', ')}`);
}

encerrar(0);
