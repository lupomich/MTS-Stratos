import { test, expect } from 'playwright/test';
import { runE2ESuite } from '../scripts/e2e-final.mjs';

test('MTS-Stratos full suite live', async () => {
    const startFrom = Number.parseInt(process.env.START_FROM || '1', 10) || 1;
    const slowMo = Number.parseInt(process.env.SLOW_MO || '250', 10) || 250;
    const headless = process.env.HEADLESS
        ? process.env.HEADLESS !== 'false'
        : false;

    const summary = await runE2ESuite({
        baseUrl: process.env.BASE_URL || 'http://localhost:3002',
        apiBase: process.env.API_BASE || 'http://localhost:3003/api',
        startFrom,
        stopOnFirstFail: false,
        headless,
        liveView: true,
        slowMo,
        testTimeout: Number.parseInt(process.env.TEST_TIMEOUT || '30000', 10) || 30000
    });

    expect(summary.failed, `Failed tests: ${summary.failed}`).toBe(0);
});
