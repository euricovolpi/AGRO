/**
 * Mede LCP, CLS e o peso do carregamento inicial no build de produção.
 * Chrome desktop com CPU e rede estranguladas para aproximar um aparelho médio.
 *
 *   node scripts/perf.mjs [porta]
 */
import {chromium} from 'playwright';

const BASE = `http://localhost:${process.argv[2] ?? 3210}`;

const navegador = await chromium.launch();
const ctx = await navegador.newContext({
  viewport: {width: 390, height: 844},
  isMobile: true,
  hasTouch: true,
});
const page = await ctx.newPage();

const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
});
await cdp.send('Emulation.setCPUThrottlingRate', {rate: 4});

let bytes = 0;
page.on('response', async (r) => {
  const t = r.request().resourceType();
  if (!['document', 'script', 'stylesheet', 'image', 'font'].includes(t)) return;
  const tamanho = Number(r.headers()['content-length'] ?? 0);
  bytes += tamanho;
});

await page.addInitScript(() => {
  window.__lcp = 0;
  window.__cls = 0;
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__lcp = e.startTime;
      window.__lcpTag = `${e.element?.tagName ?? '?'}${
        e.url ? ' ' + e.url.split('/').pop() : ''
      }`;
    }
  }).observe({type: 'largest-contentful-paint', buffered: true});
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
  }).observe({type: 'layout-shift', buffered: true});
});

await page.goto(BASE, {waitUntil: 'load'});

// Fase 1 — LCP: sem rolar. Rolar antes de fechar a medição faz o LCP se
// prender a uma imagem da segunda tela, que o visitante ainda nem viu.
await page.waitForTimeout(6000);
const lcp = await page.evaluate(() => Math.round(window.__lcp));
const clsSemRolar = await page.evaluate(() => +window.__cls.toFixed(4));

// Fase 2 — CLS de rolagem: é aqui que pin e scrub podem empurrar layout.
for (let i = 1; i <= 6; i++) {
  await page.evaluate((k) => scrollTo(0, innerHeight * k * 1.5), i);
  await page.waitForTimeout(500);
}

const m = await page.evaluate(() => ({
  lcpElemento: window.__lcpTag ?? null,
  cls: +window.__cls.toFixed(4),
  longTasks: performance.getEntriesByType('longtask')?.length ?? null,
}));
m.lcp = lcp;
m.clsAntesDeRolar = clsSemRolar;

console.log(
  JSON.stringify(
    {...m, kbCarregados: Math.round(bytes / 1024), cpu: '4x', rede: '1.6 Mbps/150ms'},
    null,
    2,
  ),
);
await navegador.close();
