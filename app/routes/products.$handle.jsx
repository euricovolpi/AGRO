import {redirect} from 'react-router';

/**
 * A loja tem um produto só, e ele é a home. Qualquer link de produto — vindo
 * da sacola, de e-mail ou de campanha — cai no bloco de compra da landing em
 * vez de numa página de produto genérica.
 * @param {Route.LoaderArgs}
 */
export async function loader() {
  return redirect('/#comprar', 301);
}

export default function Produto() {
  return null;
}

/** @typedef {import('./+types/products.$handle').Route} Route */
