import {describe, expect, it} from 'vitest';
import {criarRegistroDeEventos} from '../../app/lib/eventos';

describe('registro de eventos', () => {
  it('deixa passar a primeira vez e barra as seguintes', () => {
    const r = criarRegistroDeEventos();
    expect(r.registrar('campaign_product_reveal')).toBe(true);
    expect(r.registrar('campaign_product_reveal')).toBe(false);
    expect(r.registrar('campaign_product_reveal')).toBe(false);
    expect(r.tamanho).toBe(1);
  });

  it('separa marcos por chave — atravessar a cena de novo não conta de novo', () => {
    const r = criarRegistroDeEventos();
    ['origem', 'hero', 'origem', 'campo', 'hero'].forEach((cena) =>
      r.registrar(`campaign_scene_viewed:${cena}`),
    );
    expect(r.tamanho).toBe(3);
  });

  it('interações contam por escolha, não por clique', () => {
    const r = criarRegistroDeEventos();
    expect(r.registrar('campaign_size_select:G')).toBe(true);
    expect(r.registrar('campaign_size_select:GG')).toBe(true);
    // Voltar para um tamanho já escolhido não é uma nova decisão.
    expect(r.registrar('campaign_size_select:G')).toBe(false);
    expect(r.tamanho).toBe(2);
  });
});
