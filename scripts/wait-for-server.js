/**
 * Waits for the Vite dev server to be available before resolving.
 * Used by the electron:dev script to ensure Electron doesn't launch
 * before the dev server is ready.
 */
import waitOn from 'wait-on';

const DEV_SERVER_URL = 'http://localhost:3001';

console.log(`⏳ Waiting for Vite dev server at ${DEV_SERVER_URL}...`);

try {
  await waitOn({
    resources: [`http-get://localhost:3001`],
    timeout: 30000, // 30 seconds
    interval: 500,
    log: false,
  });
  console.log('✅ Vite dev server is ready!');
} catch {
  console.error('❌ Timed out waiting for Vite dev server.');
  process.exit(1);
}
