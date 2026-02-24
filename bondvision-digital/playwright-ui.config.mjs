import { defineConfig } from 'playwright/test';

export default defineConfig({
    testDir: './tests-live',
    fullyParallel: false,
    workers: 1,
    timeout: 60 * 60 * 1000,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        headless: false,
        viewport: { width: 1600, height: 900 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
    }
});
