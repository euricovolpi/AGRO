import {expect, test} from '@playwright/test';

/** Os onze capítulos, na ordem em que precisam aparecer no documento. */
const CAPITULOS = [
  'Agro Esporte Clube',
  'Todo time tem',
  'Nascido',
  'Do campo',
  'Não herdamos uma história',
  'Um novo símbolo',
  'O primeiro uniforme',
  'Edição Fundadora',
  'Você chegou no começo',
  'Ainda.',
  'Um dia ela será história',
  'Faça parte do primeiro capítulo',
];

test('a home de produção responde 200', async ({request}) => {
  const r = await request.get('/');
  expect(r.status()).toBe(200);
});

test('o HTML servido já traz a narrativa inteira, na ordem', async ({request}) => {
  const html = await (await request.get('/')).text();
  const texto = html.replace(/<[^>]+>/g, ' ');

  for (const capitulo of CAPITULOS) {
    const pos = texto.indexOf(capitulo);
    expect(pos, `"${capitulo}" ausente do SSR`).toBeGreaterThan(-1);
  }
});

test('sem JavaScript a página continua legível', async ({browser}) => {
  const ctx = await browser.newContext({javaScriptEnabled: false});
  const page = await ctx.newPage();
  await page.goto('/');

  // Sem JS o script de boot nunca roda, então nada no CSS esconde conteúdo.
  await expect(page.locator('html')).not.toHaveClass(/motion-ready/);
  for (const capitulo of ['Todo time tem', 'Ainda.', 'Edição Fundadora']) {
    await expect(page.getByText(capitulo, {exact: false}).first()).toBeVisible();
  }
  await ctx.close();
});

test('se o bundle falhar, o watchdog devolve o conteúdo', async ({browser}) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  // O script inline roda; o bundle principal, não. É o cenário em que a
  // promessa "o JS devolve o que o CSS escondeu" fica sem dono.
  await page.route('**/*.js', (rota) =>
    rota.request().url().includes('/assets/') ? rota.abort() : rota.continue(),
  );
  await page.goto('/');
  await page.waitForTimeout(3200);

  await expect(page.locator('html')).toHaveClass(/motion-failed/);
  await expect(page.locator('html')).not.toHaveClass(/motion-ready/);
  await expect(page.getByText('Todo time tem', {exact: false}).first()).toBeVisible();
  await ctx.close();
});

test('movimento reduzido não deixa pin nem elemento fixo para trás', async ({
  browser,
}) => {
  const ctx = await browser.newContext({reducedMotion: 'reduce'});
  const page = await ctx.newPage();
  await page.goto('/');
  await page.waitForTimeout(1500);

  const fixos = await page.evaluate(() =>
    [...document.querySelectorAll('.cena-palco')].filter(
      (el) => getComputedStyle(el).position === 'fixed',
    ).length,
  );
  expect(fixos).toBe(0);

  const espacadores = await page.locator('.pin-spacer').count();
  expect(espacadores).toBe(0);

  await expect(page.getByText('Ainda.', {exact: false}).first()).toBeVisible();
  await ctx.close();
});
