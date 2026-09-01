/**
 * Pacote de QA visual.
 *
 * Roda contra o preview de produção (workerd), não contra o dev server, e
 * navega pelo progresso real de cada ScrollTrigger em vez de adivinhar
 * coordenadas de rolagem — cenas pinadas deslocam tudo o que vem depois.
 *
 *   node scripts/qa-capturas.mjs [porta]
 */
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const PORTA = process.argv[2] ?? 3210;
// `?qa=1` liga as alças de ScrollTrigger/Lenis no build de produção.
const BASE = `http://localhost:${PORTA}/?qa=1`;

/** [arquivo, id do ScrollTrigger, progresso] */
const CENAS = [
  ['02-origem-frase-1', 'origem', 0.45],
  ['03-origem-frase-2', 'origem', 0.95],
  ['04-hero-nascido', 'hero', 0.45],
  ['05-hero-jogo', 'hero', 0.92],
  ['06-campo-000', 'campo', 0.02],
  ['07-campo-050', 'campo', 0.5],
  ['08-campo-100', 'campo', 0.98],
  ['09-escudo-000', 'escudo', 0.02],
  ['10-escudo-035', 'escudo', 0.35],
  ['11-escudo-070', 'escudo', 0.7],
  ['12-escudo-100', 'escudo', 0.98],
  ['13-reveal-antes', 'reveal', 0.4],
  ['14-reveal-depois', 'reveal', 0.95],
  ['15-turntable-frente', 'turntable', 0.04],
  ['16-turntable-perfil-d', 'turntable', 0.28],
  ['17-turntable-costas', 'turntable', 0.52],
  ['18-turntable-perfil-e', 'turntable', 0.74],
  ['19-turntable-frente-fim', 'turntable', 0.98],
  ['20-ainda', 'ainda', 0.5],
  ['21-final', 'final', 0.85],
];

async function irPara(page, id, progresso) {
  const y = await page.evaluate(
    ([i, g]) => {
      const st = window.__ST?.getById(i);
      return st ? Math.round(st.start + (st.end - st.start) * g) : null;
    },
    [id, progresso],
  );
  if (y == null) return false;
  await page.evaluate((alvo) => {
    if (window.__LENIS) window.__LENIS.scrollTo(alvo, {immediate: true, force: true});
    else scrollTo(0, alvo);
  }, y);
  await page.waitForTimeout(420);
  return true;
}

async function capturar({largura, altura, pasta, movel}) {
  await mkdir(pasta, {recursive: true});
  const navegador = await chromium.launch();
  const ctx = await navegador.newContext({
    viewport: {width: largura, height: altura},
    locale: 'pt-BR',
    isMobile: movel,
    hasTouch: movel,
  });
  const page = await ctx.newPage();
  const faltando = [];

  // O prólogo só roda na primeira visita da sessão.
  await page.goto(BASE, {waitUntil: 'domcontentloaded'});
  const inicio = Date.now();
  for (const [alvo, nome] of [[600, '00-prologo-lockup'], [1400, '01-prologo-linha']]) {
    const resta = alvo - (Date.now() - inicio);
    if (resta > 0) await page.waitForTimeout(resta);
    await page.screenshot({path: `${pasta}/${nome}.png`});
  }

  await page.waitForTimeout(1200);
  for (const [nome, id, progresso] of CENAS) {
    const ok = await irPara(page, id, progresso);
    if (!ok) {
      faltando.push(`${nome} (trigger ${id})`);
      continue;
    }
    await page.screenshot({path: `${pasta}/${nome}.png`});
  }

  // Configurador: estado padrão e personalizado.
  await page.evaluate(() => {
    const el = document.getElementById('comprar');
    const y = el.getBoundingClientRect().top + scrollY - 60;
    if (window.__LENIS) window.__LENIS.scrollTo(y, {immediate: true, force: true});
    else scrollTo(0, y);
  });
  await page.waitForTimeout(600);
  await page.screenshot({path: `${pasta}/22-configurador-padrao.png`});

  const campoNome = page.locator('#cfg-nome');
  if (await campoNome.count()) {
    await campoNome.fill('VOLPI');
    await page.locator('#cfg-numero').fill('9');
    await page.waitForTimeout(400);
    await page.screenshot({path: `${pasta}/23-configurador-personalizado.png`});
  } else {
    faltando.push('23-configurador-personalizado (sem opção de personalização no catálogo)');
  }

  if (movel) {
    await page.getByRole('button', {name: 'Menu'}).click();
    await page.waitForTimeout(400);
    await page.screenshot({path: `${pasta}/24-menu-aberto.png`});
    await page.keyboard.press('Escape');
  }

  await ctx.close();

  // Movimento reduzido: a história inteira, sem pin.
  const ctxReduzido = await navegador.newContext({
    viewport: {width: largura, height: altura},
    reducedMotion: 'reduce',
    locale: 'pt-BR',
  });
  const pr = await ctxReduzido.newPage();
  await pr.goto(BASE, {waitUntil: 'networkidle'});
  await pr.waitForTimeout(1200);
  await pr.screenshot({path: `${pasta}/25-reduzido-topo.png`});
  await pr.evaluate(() => scrollTo(0, document.body.scrollHeight * 0.55));
  await pr.waitForTimeout(600);
  await pr.screenshot({path: `${pasta}/26-reduzido-meio.png`});
  await ctxReduzido.close();

  await navegador.close();
  return faltando;
}

const faltandoDesktop = await capturar({
  largura: 1440,
  altura: 900,
  pasta: 'qa/screenshots/desktop',
  movel: false,
});
const faltandoMobile = await capturar({
  largura: 390,
  altura: 844,
  pasta: 'qa/screenshots/mobile',
  movel: true,
});

console.log(
  JSON.stringify({faltandoDesktop, faltandoMobile}, null, 2),
);
