import { defineConfig } from 'playwright/test';

export default defineConfig({
    testDir: './tests-live',
    globalSetup: './scripts/global-setup.mjs',
    fullyParallel: false,
    workers: 1,
    timeout: 60 * 60 * 1000,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        headless: process.env.HEADLESS ? process.env.HEADLESS !== 'false' : true,
        viewport: null,
        launchOptions: {
            args: ['--start-maximized']
        },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure'
    }
});
