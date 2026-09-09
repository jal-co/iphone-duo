import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:5201', viewport: { width: 1280, height: 900 }, colorScheme: 'dark' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 5201 --strictPort', url: 'http://127.0.0.1:5201', reuseExistingServer: !process.env.CI },
})
