import { test, expect } from 'playwright/test';
import { runE2ESuite } from '../scripts/e2e-final.mjs';

const TEST_IDS = [
    'T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10',
    'T11', 'T12', 'T13', 'T14', 'T15', 'T16', 'T17', 'T18', 'T19', 'T20',
    'T21', 'T22', 'T23', 'T24', 'T25', 'T26', 'T27', 'T28', 'T29', 'T30',
    'T31', 'T32', 'T33', 'T34', 'T35', 'T36', 'T37', 'T38', 'T39', 'T40',
    'T42', 'T43', 'T44', 'T45', 'T46', 'T47'
];
let suiteSummary = null;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
    suiteSummary = await runE2ESuite({
        baseUrl: process.env.BASE_URL || 'http://localhost:3002',
        apiBase: process.env.API_BASE || 'http://localhost:3003/api',
        startFrom: Number.parseInt(process.env.START_FROM || '1', 10) || 1,
        stopOnFirstFail: false,
        headless: process.env.HEADLESS ? process.env.HEADLESS !== 'false' : true,
        liveView: process.env.LIVE_VIEW === 'true',
        slowMo: Number.parseInt(process.env.SLOW_MO || '0', 10) || 0,
        testTimeout: Number.parseInt(process.env.TEST_TIMEOUT || '30000', 10) || 30000
    });
});

for (const id of TEST_IDS) {
    test(id, async () => {
        expect(suiteSummary, 'Suite summary missing').toBeTruthy();

        const result = (suiteSummary.results || []).find((entry) => entry.id === id);
        expect(result, `Result for ${id} not found`).toBeTruthy();

        const failReason = result?.failReason ? ` | reason: ${result.failReason}` : '';
        expect(result.status, `${id} status is ${result?.status || 'UNKNOWN'}${failReason}`).toBe('PASS');
    });
}
