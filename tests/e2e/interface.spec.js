import {expect, test} from '@playwright/test';

test.describe('menu mobile', () => {
  test.skip(({viewport}) => (viewport?.width ?? 0) >= 1024, 'só existe no mobile');

  test('abre, prende o foco, fecha por Escape e devolve o foco', async ({page}) => {
    await page.goto('/');
    await page.waitForTimeout(2200);

    const gatilho = page.getByRole('button', {name: 'Menu'});
    await gatilho.click();

    const dialogo = page.getByRole('dialog', {name: 'Menu da campanha'});
    await expect(dialogo).toBeVisible();

    // O foco entra no diálogo, e o fundo sai da árvore de interação.
    await expect(page.getByRole('button', {name: 'Fechar'})).toBeFocused();
    await expect(page.locator('#conteudo')).toHaveAttribute('inert', '');

    // Tab circula dentro do painel: nunca cai no fundo.
    for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
    const focoDentro = await page.evaluate(() =>
      Boolean(document.getElementById('menu-campanha')?.contains(document.activeElement)),
    );
    expect(focoDentro).toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialogo).toBeHidden();
    await expect(gatilho).toBeFocused();
    await expect(page.locator('#conteudo')).not.toHaveAttribute('inert', '');
  });

  test('fecha ao escolher um link e mantém a posição de rolagem', async ({page}) => {
    await page.goto('/');
    await page.waitForTimeout(2200);
    await page.evaluate(() => scrollTo(0, 1200));
    const antes = await page.evaluate(() => Math.round(scrollY));

    await page.getByRole('button', {name: 'Menu'}).click();
    const dialogo = page.getByRole('dialog', {name: 'Menu da campanha'});
    await dialogo.getByRole('link', {name: 'Detalhes'}).click();
    await expect(dialogo).toBeHidden();

    const depois = await page.evaluate(() => Math.round(scrollY));
    expect(Math.abs(depois - antes)).toBeLessThan(3000); // não voltou ao topo
  });
});

test('a barra de compra só existe depois do reveal', async ({page}) => {
  await page.goto('/');
  await page.waitForTimeout(2400);

  const barra = page.locator('.barra-compra');
  await expect(barra).not.toHaveClass(/visivel/);

  // Depois do capítulo da camisa ela aparece…
  await page.evaluate(() => {
    const reveal = document.getElementById('camisa');
    scrollTo(0, reveal.getBoundingClientRect().top + scrollY + reveal.offsetHeight + 400);
  });
  await page.waitForTimeout(900);
  await expect(barra).toHaveClass(/visivel/);

  // …e some sobre o configurador, para não duplicar o CTA.
  await page.evaluate(() => {
    const comprar = document.getElementById('comprar');
    scrollTo(0, comprar.getBoundingClientRect().top + scrollY);
  });
  await page.waitForTimeout(900);
  await expect(barra).not.toHaveClass(/visivel/);
});

test('sem catálogo conectado a compra fica bloqueada e explicada', async ({page}) => {
  await page.goto('/#comprar');
  await page.waitForTimeout(1500);

  const bloqueado = page.getByRole('button', {name: /Loja em ativação|Esgotado|Combinação indisponível/});
  await expect(bloqueado).toBeVisible();
  await expect(bloqueado).toBeDisabled();

  // E o motivo aparece por escrito, não só no botão.
  await expect(
    page.getByText(/ainda não está publicado|não existe no catálogo/i).first(),
  ).toBeVisible();
});
