import {defineConfig, devices} from '@playwright/test';

const PORTA = Number(process.env.PORTA_E2E ?? 3210);
const BASE = `http://localhost:${PORTA}`;

/**
 * Os E2E rodam contra o **build de produção** no workerd, não contra o dev
 * server. Foi essa diferença que já derrubou um deploy inteiro sem que build
 * nem dev acusassem nada: só `hydrogen preview` executa o bundle no mesmo
 * runtime que o Oxygen usa.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [['list'], ['html', {outputFolder: 'qa/reports/e2e', open: 'never'}]],
  use: {
    baseURL: BASE,
    locale: 'pt-BR',
    trace: 'retain-on-failure',
  },
  projects: [
    {name: 'desktop', use: {...devices['Desktop Chrome'], viewport: {width: 1440, height: 900}}},
    {name: 'mobile', use: {...devices['Pixel 7'], viewport: {width: 390, height: 844}}},
  ],
  webServer: {
    command: `npm run build && npx shopify hydrogen preview --port ${PORTA}`,
    url: BASE,
    reuseExistingServer: true,
    timeout: 180_000,
    stdout: 'pipe',
  },
});
